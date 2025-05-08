import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Attempting to connect to database...');
    
    // Test the connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    const companies = await prisma.company.findMany({
      include: {
        depts: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    console.log("test connection")
    console.log('Companies fetched successfully:', companies);
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error in companies API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch companies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 