"use client";

import React from "react";

interface ViewToggleButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function ViewToggleButton({ label, active, onClick }: ViewToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-7 py-2 rounded-full text-base font-semibold focus:outline-none transition-all duration-150 shadow-sm
        ${active
          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}
      `}
    >
      {label}
    </button>
  );
}

interface ViewToggleGroupProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export function ViewToggleGroup({ value, onChange, options }: ViewToggleGroupProps) {
  return (
    <div className="flex gap-4">
      {options.map(opt => (
        <ViewToggleButton
          key={opt}
          label={opt.charAt(0).toUpperCase() + opt.slice(1)}
          active={value === opt}
          onClick={() => onChange(opt)}
        />
      ))}
    </div>
  );
}
