import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get('namespace');

    if (!namespace) {
      return NextResponse.json({ error: 'Namespace is required' }, { status: 400 });
    }

    // Find the department by namespace
    const department = await prisma.dept.findUnique({
      where: { id: namespace },
      include: {
        docs: {
          select: {
            name: true,
            path: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Create a map to track unique paths
    const uniqueFiles = new Map<string, { name: string; path: string }>();
    
    // Process documents and ensure unique paths
    department.docs.forEach(doc => {
      if (!uniqueFiles.has(doc.path)) {
        uniqueFiles.set(doc.path, {
          name: doc.name,
          path: doc.path,
        });
      }
    });

    // Convert map to array
    const files = Array.from(uniqueFiles.values());

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
} 