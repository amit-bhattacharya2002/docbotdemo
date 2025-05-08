'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

type NamespaceContextType = {
  namespace: string | null
  setNamespace: (namespace: string | null) => void
}

const NamespaceContext = createContext<NamespaceContextType>({
  namespace: null,
  setNamespace: () => {},
})

export const useNamespace = () => useContext(NamespaceContext)

type NamespaceProviderProps = {
  children: ReactNode
}

export const NamespaceProvider = ({ children }: NamespaceProviderProps) => {
  const [namespace, setNamespace] = useState<string | null>(null)

  return (
    <NamespaceContext.Provider value={{ namespace, setNamespace }}>
      {children}
    </NamespaceContext.Provider>
  )
}

export default NamespaceContext