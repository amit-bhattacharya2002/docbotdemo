'use client';

import { useEffect } from 'react';
import { useNamespace } from '../context/NamespaceContext';

interface URLNamespaceDetectorProps {
  universityDomain: string;
  departmentPath?: string;
}

export const URLNamespaceDetector = ({ 
  universityDomain,
  departmentPath 
}: URLNamespaceDetectorProps) => {
  const { setUniversity, setDepartment } = useNamespace();

  useEffect(() => {
    // Set the university based on the domain
    setUniversity(universityDomain);

    // If department path is provided, set it
    if (departmentPath) {
      setDepartment(departmentPath);
    } else {
      // Try to detect department from URL path
      const path = window.location.pathname;
      const pathParts = path.split('/').filter(Boolean);
      
      // Assuming the department is the first part of the path
      if (pathParts.length > 0) {
        setDepartment(pathParts[0]);
      }
    }
  }, [universityDomain, departmentPath, setUniversity, setDepartment]);

  return null; // This is a utility component, it doesn't render anything
}; 