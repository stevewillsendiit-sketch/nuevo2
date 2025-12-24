"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getFavoritos, toggleFavorito } from "@/lib/favoritos.service";

interface FavoritosContextType {
  favoritos: Set<string>;
  toggle: (id: string) => void;
}

const FavoritosContext = createContext<FavoritosContextType>({ favoritos: new Set(), toggle: () => {} });

export function useFavoritos() {
  return useContext(FavoritosContext);
}

export const FavoritosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setFavoritos(new Set(getFavoritos()));
    } catch {
      setFavoritos(new Set());
    }
  }, []);

  const toggle = (id: string) => {
    const arr = toggleFavorito(id);
    setFavoritos(new Set(arr));
  };

  return (
    <FavoritosContext.Provider value={{ favoritos, toggle }}>
      {children}
    </FavoritosContext.Provider>
  );
};
