import { Document } from '@langchain/core/documents';

interface BM25Config {
  k1?: number;
  b?: number;
}

export function calculateBM25Score(
  query: string,
  document: string,
  avgDocLength: number,
  docLength: number,
  config: BM25Config = {}
): number {
  const { k1 = 1.2, b = 0.75 } = config;
  
  const queryTerms = query.toLowerCase().split(/\s+/);
  const docTerms = document.toLowerCase().split(/\s+/);
  
  let score = 0;
  
  for (const term of queryTerms) {
    const termFrequency = docTerms.filter(t => t === term).length;
    const idf = Math.log((docTerms.length + 1) / (termFrequency + 0.5));
    
    const numerator = termFrequency * (k1 + 1);
    const denominator = termFrequency + k1 * (1 - b + b * (docLength / avgDocLength));
    
    score += idf * (numerator / denominator);
  }
  
  return score;
}

export function searchDocuments(
  query: string,
  documents: Document[],
  topK: number = 5
): { document: Document; score: number }[] {
  // Calculate average document length
  const avgDocLength = documents.reduce((sum, doc) => 
    sum + doc.pageContent.split(/\s+/).length, 0) / documents.length;
  
  // Calculate BM25 scores for each document
  const scoredDocs = documents.map(doc => ({
    document: doc,
    score: calculateBM25Score(
      query,
      doc.pageContent,
      avgDocLength,
      doc.pageContent.split(/\s+/).length
    )
  }));
  
  // Sort by score and return top K
  return scoredDocs
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
} 