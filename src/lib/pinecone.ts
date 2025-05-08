import { Pinecone, ScoredPineconeRecord, RecordMetadata } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { applyRecencyBias, calculateHybridScore } from './search/recencyBias';
import { searchDocuments } from './search/keywordSearch';

let pinecone: Pinecone | null = null;

async function getPineconeClient() {
  if (pinecone) return pinecone;

  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is not set in environment variables');
  }

  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  return pinecone;
}

export async function getPineconeIndex() {
  const client = await getPineconeClient();
  return client.Index(process.env.PINECONE_INDEX_NAME!);
}

export async function queryPinecone(
  query: string | number[],
  deptId: string,
  topK: number = 5,
  useRecencyBias: boolean = true,
  semanticWeight: number = 0.7,
  keywordWeight: number = 0.3
) {
  try {
    console.log('Starting Pinecone query:', {
      deptId,
      queryType: typeof query,
      topK,
      useRecencyBias,
      semanticWeight,
      keywordWeight
    });

    const pinecone = await getPineconeClient();
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    const deptIndex = index.namespace(deptId);

    // Generate query embedding if query is a string
    const queryEmbedding = typeof query === 'string' 
      ? await new OpenAIEmbeddings().embedQuery(query)
      : query;

    // Get more initial results for better filtering
    const semanticResults = await deptIndex.query({
      vector: queryEmbedding,
      topK: topK * 4,
      includeMetadata: true,
    });

    // If query is a string, also perform keyword search
    let keywordScores: number[] = [];
    if (typeof query === 'string') {
      const documents = semanticResults.matches?.map(match => new Document({
        pageContent: String(match.metadata?.text || ''),
        metadata: match.metadata || {}
      })) || [];
      
      const keywordResults = searchDocuments(query, documents, topK * 4);
      keywordScores = semanticResults.matches?.map(match => {
        const keywordMatch = keywordResults.find(
          r => r.document.metadata?.text === match.metadata?.text
        );
        return keywordMatch?.score || 0;
      }) || [];
    } else {
      keywordScores = semanticResults.matches?.map(() => 0.5) || [];
    }

    // Get vectors and semantic scores
    const vectors = semanticResults.matches?.map(match => ({
      id: match.id,
      values: match.values || [],
      metadata: match.metadata || {},
    })) || [];

    const semanticScores = semanticResults.matches?.map(match => match.score || 0) || [];

    // Apply recency bias if enabled
    const results = useRecencyBias
      ? applyRecencyBias(vectors, semanticScores, keywordScores, topK)
      : vectors.map((vector, i) => ({
          vector,
          finalScore: calculateHybridScore(
            semanticScores[i], 
            keywordScores[i],
            semanticWeight,
            keywordWeight
          )
        }))
          .sort((a, b) => b.finalScore - a.finalScore)
          .slice(0, topK);

    return results.map(result => ({
      id: result.vector.id,
      score: result.finalScore,
      metadata: result.vector.metadata,
    }));
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
}