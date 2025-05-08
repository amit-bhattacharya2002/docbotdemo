interface Vector {
  id: string;
  values: number[];
  metadata: Record<string, any>;
}

// Time bucket definitions in milliseconds
export const TIME_BUCKETS = {
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  FOUR_WEEKS: 28 * 24 * 60 * 60 * 1000,
};

// Bucket weights
export const BUCKET_WEIGHTS = {
  ONE_HOUR: 1.2,
  ONE_DAY: 1.0,
  ONE_WEEK: 0.9,
  FOUR_WEEKS: 0.8,
  OLDER: 0.7,
};

// Determine which time bucket a document belongs to
export function getTimeBucket(timestamp: number): keyof typeof BUCKET_WEIGHTS {
  const now = Date.now();
  const age = now - timestamp;

  if (age <= TIME_BUCKETS.ONE_HOUR) return 'ONE_HOUR';
  if (age <= TIME_BUCKETS.ONE_DAY) return 'ONE_DAY';
  if (age <= TIME_BUCKETS.ONE_WEEK) return 'ONE_WEEK';
  if (age <= TIME_BUCKETS.FOUR_WEEKS) return 'FOUR_WEEKS';
  return 'OLDER';
}

// Normalize scores using min-max scaling
export function normalizeScores(scores: number[]): number[] {
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  
  if (min === max) {
    return scores.map(() => 1.0);
  }
  
  return scores.map(score => (score - min) / (max - min));
}

// Calculate hybrid score combining semantic and keyword scores
export function calculateHybridScore(
  semanticScore: number,
  keywordScore: number,
  semanticWeight: number = 0.5,
  keywordWeight: number = 0.5
): number {
  return semanticWeight * semanticScore + keywordWeight * keywordScore;
}

// Apply recency bias to a set of vectors
export function applyRecencyBias(
  vectors: Vector[],
  semanticScores: number[],
  keywordScores: number[],
  topK: number = 5
): { vector: Vector; finalScore: number }[] {
  // Group vectors by time bucket
  const bucketGroups = new Map<keyof typeof BUCKET_WEIGHTS, Vector[]>();
  const bucketSemanticScores = new Map<keyof typeof BUCKET_WEIGHTS, number[]>();
  const bucketKeywordScores = new Map<keyof typeof BUCKET_WEIGHTS, number[]>();

  vectors.forEach((vector, index) => {
    const timestamp = Number(vector.metadata?.timestamp) || Date.now();
    const bucket = getTimeBucket(timestamp);

    if (!bucketGroups.has(bucket)) {
      bucketGroups.set(bucket, []);
      bucketSemanticScores.set(bucket, []);
      bucketKeywordScores.set(bucket, []);
    }

    bucketGroups.get(bucket)!.push(vector);
    bucketSemanticScores.get(bucket)!.push(semanticScores[index]);
    bucketKeywordScores.get(bucket)!.push(keywordScores[index]);
  });

  // Process each bucket
  const results: { vector: Vector; finalScore: number }[] = [];

  bucketGroups.forEach((bucketVectors, bucket) => {
    const semanticScores = bucketSemanticScores.get(bucket)!;
    const keywordScores = bucketKeywordScores.get(bucket)!;

    // Calculate hybrid scores
    const hybridScores = bucketVectors.map((_, index) =>
      calculateHybridScore(semanticScores[index], keywordScores[index])
    );

    // Normalize hybrid scores within the bucket
    const normalizedScores = normalizeScores(hybridScores);

    // Apply bucket weight
    const weightedScores = normalizedScores.map(score => 
      score * BUCKET_WEIGHTS[bucket]
    );

    // Add to results
    bucketVectors.forEach((vector, index) => {
      results.push({
        vector,
        finalScore: weightedScores[index]
      });
    });
  });

  // Sort by final score and take top K
  return results
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, topK);
} 