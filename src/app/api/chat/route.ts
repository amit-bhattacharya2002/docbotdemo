// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function POST(request: Request) {
//   try {
//     const { message, departmentId } = await request.json();

//     // Validate the request
//     if (!message || !departmentId) {
//       return NextResponse.json(
//         { error: 'Message and departmentId are required' },
//         { status: 400 }
//       );
//     }

//     // Get department settings
//     const department = await prisma.dept.findUnique({
//       where: { id: departmentId },
//       include: {
//         settings: true,
//       },
//     });

//     if (!department) {
//       return NextResponse.json(
//         { error: 'Department not found' },
//         { status: 404 }
//       );
//     }

//     // TODO: Implement your chat logic here
//     // This is where you'll integrate with your AI model
//     // For now, we'll return a mock response
//     const response = {
//       message: `I received your message: "${message}". This is a mock response.`,
//     };

//     // Log the chat session
//     await prisma.chatSession.create({
//       data: {
//         sessionId: Math.random().toString(36).substring(7),
//         deptId: departmentId,
//         messages: JSON.stringify([
//           { role: 'user', content: message },
//           { role: 'assistant', content: response.message },
//         ]),
//       },
//     });

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('Chat API Error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// } 