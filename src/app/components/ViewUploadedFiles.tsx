import { useState } from "react";

export const fetchFiles =  () => {
    // const [file, setFile] = useState<File | null>(null);
    //   const [uploadStatus, setUploadStatus] = useState('');
      const [files, setFiles] = useState<string[]>([]);
      const [listError, setListError] = useState('');
      const [loading, setLoading] = useState(false);
      const fetchFiles = async () => {
          setLoading(true);
          setListError('');
          try {
              const res = await fetch('/api/files');
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
    }