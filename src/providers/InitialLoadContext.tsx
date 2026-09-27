// providers/InitialLoadContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface InitialLoadContextType {
  isFirstVisit: boolean;
  completeFirstVisit: () => void;
}

const InitialLoadContext = createContext<InitialLoadContextType | undefined>(undefined);

export function InitialLoadProvider({ children }: { children: ReactNode }) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("hasLoadedOnce");
    if (!hasLoaded) {
      setIsFirstVisit(true);
    }
    setHasChecked(true);
  }, []);

  const completeFirstVisit = () => {
    sessionStorage.setItem("hasLoadedOnce", "true");
    setIsFirstVisit(false);
  };

  if (!hasChecked) return <div className="fixed inset-0 bg-off-white z-99999" />;

  return (
    <InitialLoadContext.Provider value={{ isFirstVisit, completeFirstVisit }}>
      {children}
    </InitialLoadContext.Provider>
  );
}

export const useInitialLoad = () => {
  const context = useContext(InitialLoadContext);
  if (!context) throw new Error("useInitialLoad must be used within InitialLoadProvider");
  return context;
};