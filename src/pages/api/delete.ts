// src/pages/api/delete.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPineconeIndex } from '@/lib/pinecone';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Missing filename' });
  }

  try {
    const index = await getPineconeIndex();
    
    // Get initial stats
    const statsBefore = await index.describeIndexStats();
    console.log(`Current total vectors: ${statsBefore.totalRecordCount}`);

    // First, query to find all vectors for this file
    const queryResponse = await index.query({
      vector: new Array(1536).fill(0), // Required for query
      filter: {
        source: filename
      },
      topK: 10000,
      includeMetadata: true
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return res.status(404).json({ message: `No vectors found for file ${filename}` });
    }

    console.log(`Found ${queryResponse.matches.length} vectors to delete for file ${filename}`);

    // Delete each vector
    let deletedCount = 0;
    for (const match of queryResponse.matches) {
      try {
        await index.deleteOne(match.id);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting vector ${match.id}:`, error);
      }
    }

    // Get final stats
    const statsAfter = await index.describeIndexStats();
    
    return res.status(200).json({ 
      message: `Deleted ${deletedCount} vectors for file ${filename}`,
      totalFound: queryResponse.matches.length,
      totalDeleted: deletedCount,
      vectorsBefore: statsBefore.totalRecordCount,
      vectorsAfter: statsAfter.totalRecordCount
    });
  } catch (error: any) {
    console.error("Deletion error:", error.message, error);
    return res.status(500).json({ error: error.message || 'Error deleting file' });
  }
}
