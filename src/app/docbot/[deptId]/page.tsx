'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNamespace } from '../../context/NamespaceContext';
import SearchUI from '../../components/SearchUI';
import { Sidepanel } from '@/app/components/Sidepanel';

export default function DocBotPage() {
  const params = useParams();
  const { setNamespace } = useNamespace();
  const deptId = params?.deptId as string;

  useEffect(() => {
    if (deptId) {
      setNamespace(deptId);
    }
  }, [deptId, setNamespace]);

  return (
    <div className="h-[90vh] w-full flex flex-row">
      <Sidepanel />
      <SearchUI />
    </div>
  );
} 