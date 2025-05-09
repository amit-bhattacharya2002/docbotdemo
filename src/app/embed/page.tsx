'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NamespaceProvider } from '../context/NamespaceContext';
import { URLNamespaceDetector } from '../components/URLNamespaceDetector';
import Docbot from '../sfudocbot/components/Docbot';

export default function EmbedPage() {
  const searchParams = useSearchParams();
  const university = searchParams?.get('university') || '';
  const department = searchParams?.get('department') || '';

  return (
    <NamespaceProvider
      initialUniversity={university || null}
      initialDepartment={department || null}
    >
      <URLNamespaceDetector
        universityDomain={university}
        departmentPath={department || undefined}
      />
      <div className="h-screen w-full">
        <Docbot />
      </div>
    </NamespaceProvider>
  );
} 