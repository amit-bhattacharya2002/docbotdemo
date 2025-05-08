'use client';

import { useState, useEffect } from 'react';
import { useNamespace } from '../context/NamespaceContext';

interface File {
  name: string;
  path: string;
}

export default function UploadDocument() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { namespace } = useNamespace();

  // Function to fetch list of uploaded files
  const fetchFiles = async () => {
    if (!namespace) {
      setFiles([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/files?namespace=${namespace}`);
      if (!res.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setError('Error fetching files');
    } finally {
      setLoading(false);
    }
  };

  // Fetch uploaded files when namespace changes
  useEffect(() => {
    fetchFiles();
  }, [namespace]);

  return (
    <div className="w-full">
      <div className="mt-4">
        <h3 className="text-xl border-b-2 font-semibold mb-2">Available Documents</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : files.length === 0 ? (
          <p>No documents available</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.path} className="flex items-center">
                <span className="truncate">{file.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 