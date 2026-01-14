// src/context/LocationCacheContext.tsx
'use client';

import { createContext, useState, useContext } from 'react';
import { Location } from '@/lib/types';

type LocationCacheContextType = {
  cache: Record<number, Location>;
  addToCache: (locations: Location[]) => void;
};

const LocationCacheContext = createContext<LocationCacheContextType>({
  cache: {},
  addToCache: () => {}
});

export function LocationCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Record<number, Location>>({});

  const addToCache = (locations: Location[]) => {
    setCache(prev => {
      const newCache = { ...prev };
      locations.forEach(loc => {
        newCache[loc.id] = loc;
      });
      return newCache;
    });
  };

  return (
    <LocationCacheContext.Provider value={{ cache, addToCache }}>
      {children}
    </LocationCacheContext.Provider>
  );
}

export function useLocationCache() {
  return useContext(LocationCacheContext);
}