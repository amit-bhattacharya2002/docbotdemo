'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNamespace } from "../context/NamespaceContext";

interface Department {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
  depts: Department[];
}

export const NoAccountPrompt = () => {
  const { setNamespace } = useNamespace();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log('Fetching companies...');
        const response = await fetch('/api/companies');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Companies data:', data);
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError('Failed to load companies. Please try again later.');
      }
    };

    fetchCompanies();
  }, []);

  const handleDepartmentSelect = (deptId: string) => {
    setSelectedDepartment(deptId);
    setNamespace(deptId);
    router.push(`/docbot/${deptId}`);
  };

  return (
    <div className="w-1/2 m-auto h-1/2 py-10 flex flex-col items-center justify-between gap-5 text-white border-1 border-green-500 rounded-lg shadow-lg">
      <h1 className="text-4xl text-center text-green-500">Welcome to <span className="text-white">DocBot</span> <br /> Your One Stop Document Assistant.</h1>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      <div className="w-full flex flex-col items-center gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-white mb-2">Select Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full h-10 rounded-lg border-2 border-green-500 p-2 text-white bg-transparent"
          >
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCompany && (
          <div className="w-1/2">
            <label className="block text-sm font-medium text-white mb-2">Select Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full h-10 rounded-lg border-2 border-green-500 p-2 text-white bg-transparent"
            >
              <option value="">Select a department</option>
              {companies
                .find((c) => c.id === selectedCompany)
                ?.depts.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {selectedDepartment && (
          <button
            onClick={() => handleDepartmentSelect(selectedDepartment)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Launch DocBot
          </button>
        )}
      </div>
    </div>
  );
};