import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { getPineconeIndex } from '@/lib/pinecone';

const EMBED_MODEL = 'text-embedding-ada-002';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export async function POST(req: NextRequest) {
  try {
    const { query, namespace, conversationHistory = [] } = await req.json();

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
      
    // Format conversation history
    const formattedHistory = conversationHistory
      .map((msg: Message) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Get the last user message from the conversation history
    const lastUserMessage = conversationHistory
      .filter((msg: Message) => msg.type === 'user')
      .pop()?.content || '';

    // Prepend the last user message to the current question if it exists
    const disambiguatedQuestion = lastUserMessage
      ? `Previous user message: "${lastUserMessage}"
Follow-up question: "${query}"`
      : query;

    const prompt = `You are a helpful document assistant. Answer questions based on context and conversation history.

CONVERSATION HISTORY:
${formattedHistory}

GUIDELINES:
1. Answer using context and conversation history
2. Stay consistent with previous answers
3. Use conversation history for context references
4. If context is insufficient, provide partial answer
5. If no relevant info, say "I don't have enough information to answer this question"
6. Be concise but comprehensive
7. Acknowledge multiple perspectives if present
8. Clarify ambiguous questions before answering
9. Include relevant links naturally in text (e.g., "For more info: link:")

PRONOUN RESOLUTION:
For vague pronouns (it, there, that):
- Check conversation history for matching antecedents
- If one clear match exists, use it
- If ambiguous, ask: "Are you referring to [Entity A] or [Entity B]?"
- For vague questions, assume reference to last message: "${lastUserMessage}"

CONTEXT:
${contexts.join("\n---\n")}

QUESTION: ${disambiguatedQuestion}

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