'use client';

import React, { useEffect, Suspense, ErrorInfo } from 'react';
import { useSearchParams } from 'next/navigation';
import { NamespaceProvider } from '../context/NamespaceContext';
import { URLNamespaceDetector } from '../components/URLNamespaceDetector';
import Docbot from '../sfudocbot/components/Docbot';

interface EmbedContentProps {}

function LoadingState() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#ffeaea]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#982727] mb-4"></div>
      <p className="text-[#982727] font-medium">Loading SFU DocBot...</p>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Embed Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#ffeaea] p-4">
          <h2 className="text-[#982727] text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 text-center mb-4">
            We're having trouble loading the SFU DocBot. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#982727] text-white rounded-lg hover:bg-[#7a1e1e] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function EmbedContent() {
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

export default function EmbedPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <EmbedContent />
      </Suspense>
    </ErrorBoundary>
  );
} 