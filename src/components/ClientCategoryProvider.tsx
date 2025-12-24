"use client";
import { useState } from "react";
import { Categoria } from "@/types";
import { CategoryContext } from "./GlobalCategoryBar";

export default function ClientCategoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  return (
    <CategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}