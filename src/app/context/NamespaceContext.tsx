'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type NamespaceContextType = {
  namespace: string | null
  setNamespace: (namespace: string | null) => void
  university: string | null
  department: string | null
  setUniversity: (university: string | null) => void
  setDepartment: (department: string | null) => void
}

const NamespaceContext = createContext<NamespaceContextType>({
  namespace: null,
  setNamespace: () => {},
  university: null,
  department: null,
  setUniversity: () => {},
  setDepartment: () => {},
})

export const useNamespace = () => useContext(NamespaceContext)

type NamespaceProviderProps = {
  children: ReactNode
  initialUniversity?: string | null
  initialDepartment?: string | null
}

export const NamespaceProvider = ({ 
  children, 
  initialUniversity = null,
  initialDepartment = null 
}: NamespaceProviderProps) => {
  const [namespace, setNamespace] = useState<string | null>(null)
  const [university, setUniversity] = useState<string | null>(initialUniversity)
  const [department, setDepartment] = useState<string | null>(initialDepartment)

  useEffect(() => {
    // If we have both university and department, set the namespace
    if (university && department) {
      setNamespace(`${university}-${department}`)
    }
  }, [university, department])

  return (
    <NamespaceContext.Provider value={{ 
      namespace, 
      setNamespace,
      university,
      department,
      setUniversity,
      setDepartment
    }}>
      {children}
    </NamespaceContext.Provider>
  )
}

export default NamespaceContext