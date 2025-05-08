'use client';

interface SearchResult {
  id: string;
  score: number;
  metadata: {
    text: string;
    name: string;
    timestamp?: number;
  };
}

interface SearchResultsProps {
  results: SearchResult[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-4">
        No results found
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {results.map((result) => (
        <div
          key={result.id}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{result.metadata.name}</h3>
            <span className="text-sm text-gray-500">
              Score: {result.score.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-gray-600 line-clamp-3">
            {result.metadata.text}
          </p>
          {result.metadata.timestamp && (
            <div className="mt-2 text-sm text-gray-500">
              Last updated: {new Date(result.metadata.timestamp).toLocaleDateString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 