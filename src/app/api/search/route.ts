import { NextResponse } from 'next/server';
import { queryPinecone } from '@/lib/pinecone';

export async function POST(req: Request) {
  try {
    const { query, deptId, useRecencyBias, resultCount, semanticWeight, keywordWeight } = await req.json();

    if (!query || !deptId) {
      return NextResponse.json(
        { error: 'Query and deptId are required' },
        { status: 400 }
      );
    }

    const results = await queryPinecone(
      query,
      deptId,
      resultCount || 5,
      useRecencyBias ?? true,
      semanticWeight ?? 0.7,
      keywordWeight ?? 0.3
    );
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 