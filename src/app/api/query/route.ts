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

    // Extract the last user message before the current one
    const userMessages = conversationHistory.filter((msg: Message) => msg.type === 'user');
    const lastUserMessage = userMessages.length > 1 ? userMessages[userMessages.length - 2].content : '';

    // Prepend the last user message to the current question if it exists
    const disambiguatedQuestion = lastUserMessage
      ? `Previous user message: "${lastUserMessage}"
Follow-up question: "${query}"`
      : query;

    const prompt = `You are a helpful document assistant. Your task is to answer questions based on the provided context and conversation history.

CONVERSATION HISTORY:
${formattedHistory}

INSTRUCTIONS:
1. Answer based on the information provided in the context below and the conversation history above.
2. Maintain consistency with previous answers.
3. If the question refers to previous context, use that information.
4. If the context doesn't contain enough information to answer the question, try to provide a partial answer based on what you can infer from the available information.
5. If you can't find any relevant information, say "I don't have enough information to answer this question."
6. Be concise but comprehensive in your answer.
7. If the context contains multiple perspectives, acknowledge them in your answer.
8. If the question is ambiguous, clarify what you're answering before providing the answer.
9. IMPORTANT: Always include relevant links from the context in your response. If the context contains URLs that are relevant to the answer, include them in your response. Format the links naturally within your text, for example: "You can find more information at link:" or "For detailed instructions, visit link:"  DONT ADD ANY BRACKETS OR ANYTHING ELSE TO THE LINKS OR THE TEXTS PRECEEDING THEM, OR FOLLOWING THEM. DONT ENCLOSE THE LINKS IN BRACKETS OR ANYTHING ELSE. You can add a : at the end of the text preceeding the link to make the formatting better

IMPORTANT:
Whenever the user asks a question that refers to "it," "there," "that," or similarly vague pronouns or expressions, you must: Scan {${formattedHistory}} for the most recent noun or entity that matches number and semantic type. If exactly one clear antecedent exists, rewrite the question in your head using that antecedent and answer as if the user had said it explicitly. If multiple possible antecedents remain or you're not 100% certain, politely ask a single clarifying question before answering—for example: "Just to make sure—when you say 'it,' are you referring to [Entity A] or [Entity B]?" Always default to inference from {${formattedHistory}} before asking for clarification.

IMPORTANT:If the user's question is vague (e.g., "How long does it take?"), assume they are referring to their most recent previous message: "${lastUserMessage}"

Only ask for clarification if the reference is still ambiguous after considering the last user message.

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
