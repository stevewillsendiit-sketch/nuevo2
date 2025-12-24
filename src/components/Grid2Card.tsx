"use client";

import React from "react";
import Image from "next/image";
import { FaTruck } from "react-icons/fa";

interface Grid2CardProps {
  image: string;
  price: string;
  title: string;
  shipping?: boolean;
}

export default function Grid2Card({ image, price, title, shipping }: Grid2CardProps) {
  return (
    <div className="rounded-2xl bg-white shadow p-0 overflow-hidden flex flex-col" style={{ minWidth: 220, maxWidth: 320 }}>
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover rounded-t-2xl"
        />
      </div>
      <div className="p-4 pb-2 flex flex-col flex-1">
        <div className="text-xl font-bold text-gray-900 mb-1">{price}</div>
        <div className="text-base text-gray-800 truncate mb-2">{title}</div>
        {shipping && (
          <div className="flex items-center gap-1 text-sm text-purple-600 font-semibold mt-auto">
            <FaTruck className="w-4 h-4" />
            Envío disponible
          </div>
        )}
      </div>
    </div>
  );
}
