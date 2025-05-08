'use client';

import { useState } from 'react';

export default function SearchUI() {
  const [query, setQuery] = useState('');
  const [namespaceId, setNamespaceId] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !namespaceId.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, namespaceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
      setSources(data.sources);
    } catch (err) {
      setError('Error getting answer. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Document Query</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="namespaceId" className="block text-sm font-medium text-gray-700 mb-1">
                Namespace ID
              </label>
              <input
                type="text"
                id="namespaceId"
                value={namespaceId}
                onChange={(e) => setNamespaceId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your namespace ID"
                required
              />
            </div>

            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                Your Question
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Ask a question about your documents..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim() || !namespaceId.trim()}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading || !query.trim() || !namespaceId.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Getting Answer...' : 'Get Answer'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {answer && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Answer</h2>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="whitespace-pre-wrap">{answer}</p>
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Sources</h2>
              <ul className="list-disc list-inside">
                {sources.map((source, index) => (
                  <li key={index} className="text-gray-600">{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 