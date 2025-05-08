import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { getPineconeIndex } from '@/lib/pinecone';

const EMBED_MODEL = 'text-embedding-ada-002';

export async function POST(req: NextRequest) {
  try {
    const { query, namespace } = await req.json();

    if (!namespace) {
      return NextResponse.json({ error: 'Namespace ID is required.' }, { status: 400 });
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    console.log('Starting query process:', { query, namespace });

    const index = await getPineconeIndex(); 
    console.log('Got Pinecone index');

    const embeddingRes = await openai.embeddings.create({
      input: [query],
      model: EMBED_MODEL,
    });
    console.log('Generated embeddings');

    const queryEmbed = embeddingRes.data[0].embedding;
    console.log('Embedding dimensions:', queryEmbed.length);

    // Create a namespace-specific index
    const namespaceIndex = index.namespace(namespace);
    console.log('Created namespace index:', namespace);

    const result = await namespaceIndex.query({
      vector: queryEmbed,
      topK: 10,
      includeMetadata: true,
    });
    console.log('Query results:', {
      matches: result.matches.length,
      firstMatch: result.matches[0]?.metadata
    });

    const contexts = result.matches.map((m) => m.metadata?.text || '');
    
    // Extract sources and deduplicate them, filtering out empty or undefined sources
    const sources = [...new Set(result.matches
      .map((m) => m.metadata?.source)
      .filter((source): source is string => !!source))];
    
    const prompt = `You are a helpful document assistant. Your task is to answer questions based on the provided context.

INSTRUCTIONS:
1. Answer based on the information provided in the context below.
2. If the context doesn't contain enough information to answer the question, try to provide a partial answer based on what you can infer from the available information.
3. If you can't find any relevant information, say "I don't have enough information to answer this question."
4. Be concise but comprehensive in your answer.
5. If the context contains multiple perspectives, acknowledge them in your answer.
6. If the question is ambiguous, clarify what you're answering before providing the answer.
7. IMPORTANT: Always include relevant links from the context in your response. If the context contains URLs that are relevant to the answer, include them in your response. Format the links naturally within your text, for example: "You can find more information at link:" or "For detailed instructions, visit link:"  DONT ADD ANY BRACKETS OR ANYTHING ELSE TO THE LINKS OR THE TEXTS PRECEEDING THEM, OR FOLLOWING THEM. DONT ENCLOSE THE LINKS IN BRACKETS OR ANYTHING ELSE.

CONTEXT:
${contexts.join("\n---\n")}

QUESTION: ${query}

ANSWER:`;

    console.log('Sending prompt to GPT-4');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    console.log('Received response from GPT-4');

    const answer = completion.choices[0].message.content;
    console.log('Query completed successfully:', {
      query,
      namespace,
      matches: result.matches.length,
      sources,
      answerLength: answer?.length
    });
    
    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error('Query error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Error processing query.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
