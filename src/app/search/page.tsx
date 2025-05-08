'use client';

import { useState } from 'react';
import BasicSearch from '@/components/search/BasicSearch';
import SearchResults from '@/components/search/SearchResults';

export default function SearchPage() {
  const [results, setResults] = useState<any[]>([]);
  const deptId = 'YOUR_DEPT_ID'; // This should come from your app's context or params

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Documents</h1>
      <BasicSearch deptId={deptId} onResults={setResults} />
      <SearchResults results={results} />
    </div>
  );
}