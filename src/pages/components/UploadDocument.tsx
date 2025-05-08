// src/components/UploadDocument.tsx
'use client';

import { useState, useEffect } from 'react';
import { useNamespace } from '../../app/context/NamespaceContext';

export default function UploadDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [listError, setListError] = useState('');
  const [loading, setLoading] = useState(false);
  const { namespace } = useNamespace();

  // Handler for uploading a file
  const handleUpload = async () => {
    if (!file) return;
    if (!namespace) {
      alert('Please enter a namespace ID first');
      return;
    }

    setUploadStatus('Uploading and processing...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('namespaceId', namespace);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${text}`);
      }
      const data = await res.json();
      setUploadStatus(data.message || 'Upload complete');
      // Refresh the file list after successful upload
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      setUploadStatus('An error occurred during upload.');
    }
  };

  // Function to fetch list of uploaded files
  const fetchFiles = async () => {
    if (!namespace) {
      setFiles([]);
      return;
    }

    setLoading(true);
    setListError('');
    try {
      const res = await fetch(`/api/files?namespace=${namespace}`);
      if (!res.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setListError('Error fetching files');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle file deletion
  const handleDelete = async (filename: string) => {
    if (!namespace) {
      alert('Please enter a namespace ID first');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, namespace }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      // Remove deleted file from state
      setFiles((prev) => prev.filter((f) => f !== filename));
    } catch (err: any) {
      console.error(err);
      alert(`Error deleting file: ${err.message}`);
    }
  };

  // Fetch uploaded files when namespace changes
  useEffect(() => {
    fetchFiles();
  }, [namespace]);

  return (
    <div className="mx-auto my-8 h-[50%] w-full">
      <h2 className="text-xl font-semibold mb-2 border-b-1 pb-2 w-full">Uploaded Files</h2>
      {!namespace ? (
        <p className="text-yellow-500">Please enter a namespace ID to view files</p>
      ) : loading ? (
        <p>Loading files...</p>
      ) : listError ? (
        <p className="text-red-500">{listError}</p>
      ) : files.length > 0 ? (
        <ul className='mb-[50%] h-[70%] w-full overflow-y-scroll'>
          {files.map((filename) => (
            <li key={filename} className="flex w-full text-sm p-2 items-center justify-between my-1">
              <span className='text-wrap w-full'>{filename}</span>
              {/* <button onClick={() => handleDelete(filename)} className="text-red-600">
                ❌
              </button> */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No files found in namespace: {namespace}</p>
      )}
    </div>
  );
}
