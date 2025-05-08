'use client';

import { useState } from 'react';

interface SearchResult {
  id: string;
  score: number;
  metadata: {
    text: string;
    name: string;
    timestamp?: number;
    chunkIndex?: number;
    totalChunks?: number;
  };
}

export default function SearchUI() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [advancedOptions, setAdvancedOptions] = useState({
    useRecencyBias: true,
    resultCount: 5,
    semanticWeight: 0.7,
    keywordWeight: 0.3
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          deptId: 'YOUR_DEPT_ID', // Replace with actual deptId
          ...advancedOptions 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const searchResults = await response.json();
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={advancedOptions.useRecencyBias}
                  onChange={(e) => setAdvancedOptions(prev => ({
                    ...prev,
                    useRecencyBias: e.target.checked
                  }))}
                  className="rounded text-blue-500"
                />
                <span>Use Recency Bias</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label>Number of Results:</label>
              <select
                value={advancedOptions.resultCount}
                onChange={(e) => setAdvancedOptions(prev => ({
                  ...prev,
                  resultCount: parseInt(e.target.value)
                }))}
                className="border rounded px-2 py-1"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>

            <div className="space-y-2">
              <label>Search Algorithm Weights:</label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600">Semantic Weight</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={advancedOptions.semanticWeight}
                    onChange={(e) => setAdvancedOptions(prev => ({
                      ...prev,
                      semanticWeight: parseFloat(e.target.value),
                      keywordWeight: 1 - parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                  <span className="text-sm">{advancedOptions.semanticWeight.toFixed(1)}</span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600">Keyword Weight</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={advancedOptions.keywordWeight}
                    onChange={(e) => setAdvancedOptions(prev => ({
                      ...prev,
                      keywordWeight: parseFloat(e.target.value),
                      semanticWeight: 1 - parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                  <span className="text-sm">{advancedOptions.keywordWeight.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div> */}
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{result.metadata.name}</h3>
                    {result.metadata.chunkIndex !== undefined && result.metadata.totalChunks !== undefined && (
                      <span className="text-sm text-gray-500">
                        Part {result.metadata.chunkIndex + 1} of {result.metadata.totalChunks}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      Score: {result.score.toFixed(2)}
                    </span>
                    {result.metadata.timestamp && (
                      <div className="text-sm text-gray-500">
                        {new Date(result.metadata.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-gray-600 line-clamp-3">
                  {result.metadata.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 