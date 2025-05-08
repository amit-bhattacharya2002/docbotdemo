'use client';

import { useState } from 'react';
import { useNamespace } from '../context/NamespaceContext';
import { Sidepanel } from './Sidepanel';

export default function SearchUI() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    useRecencyBias: true,
    resultCount: 5,
    semanticWeight: 0.7,
    keywordWeight: 0.3
  });
  const { namespace } = useNamespace();

  const handleSearch = async () => {
    if (!namespace) {
      alert('Please enter a namespace ID first');
      return;
    }
    console.log('Searching for:', query, 'in namespace:', namespace);
    setLoading(true);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          namespace,
          ...advancedOptions 
        }),
      });

      if (!res.ok) {
        throw new Error('Query failed');
      }

      const data = await res.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing your query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`w-full ${answer ? 'h-screen py-5 mb-5' : 'h-fit my-auto'} overflow-hidden py-5 mx-5 transition-color duration-300`}>
      {/* <h1 className="text-5xl text-neutral-600 font-bold mb-6 text-center">Ask a question <br></br> about your documents</h1> */}

      <div className={`flex flex-col item-center gap-4 my-auto w-auto mx-10`}>
        <div className="flex flex-row gap-4">
          <input
            type="text"
            placeholder="ask a question about your documents"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-green-500 px-3 py-2 rounded text-green-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !namespace}
            className={`border-1 px-4 py-2 rounded ${
              loading || !namespace
                ? 'bg-gray-400 cursor-not-allowed'
                : 'hover:bg-green-900 transition-color duration-400 hover:border-green-900 hover:scale-[1.1] text-white'
            }`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-green-500 hover:text-green-700 self-end"
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button> */}

        {showAdvanced && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-green-500">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={advancedOptions.useRecencyBias}
                  onChange={(e) => setAdvancedOptions(prev => ({
                    ...prev,
                    useRecencyBias: e.target.checked
                  }))}
                  className="rounded text-green-500"
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
                className="border rounded px-2 py-1 border-green-500"
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
                    className="w-full accent-green-500"
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
                    className="w-full accent-green-500"
                  />
                  <span className="text-sm">{advancedOptions.keywordWeight.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-full overflow-y-scroll mt-5">
        {answer && (
          <div className={`m-10 border-1 p-4 rounded ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} transition-color duration-1000 flex justify-between flex-col h-fit`}>
            <div className='h-full pb-5'>
              <h2 className="text-lg font-semibold">Answer:</h2>
              <p className="my-2">
                {answer ? answer : 'No answer found. Please try a different question.'}
              </p>
              {sources.length > 0 && (
                <div className="my-4 border-t pt-2">
                  <h3 className="font-semibold">Sources:</h3>
                  <ul className="list-disc ml-5 mt-1">
                    {sources.map((src, i) => (
                      <li key={i}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} border p-2`}
            >
              <div>toggle dark mode</div>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}