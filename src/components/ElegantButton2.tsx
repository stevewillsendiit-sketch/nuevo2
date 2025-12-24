"use client";

import React from "react";

interface ElegantButton2Props {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function ElegantButton2({ children, onClick, className = "", type = "button" }: ElegantButton2Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
}
