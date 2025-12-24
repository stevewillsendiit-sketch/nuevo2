"use client";

import React from 'react';
import Image from 'next/image';

export default function HeroCards() {
  return (
    <div className="max-w-7xl w-full px-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col lg:flex-row items-stretch">
          <div className="lg:w-1/2 bg-gray-900 flex items-center justify-center p-6">
            <Image src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80&auto=format&fit=crop" alt="Paint care" width={900} height={600} className="object-cover w-full h-56 lg:h-full rounded-l-2xl" />
          </div>
          <div className="p-8 flex-1 flex flex-col justify-center gap-4">
            <div className="h-1 w-12 bg-yellow-400 rounded" />
            <h3 className="text-2xl font-extrabold text-gray-900">Paint care</h3>
            <p className="text-gray-600">Pellentesque eu nibh eget mauris congue mattis mattis nec tellus.</p>
            <div>
              <button className="mt-4 px-5 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 inline-flex items-center gap-2">
                See products <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </article>

        <article className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col lg:flex-row-reverse items-stretch">
          <div className="lg:w-1/2 bg-gray-50 flex items-center justify-center p-6">
            <Image src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&q=80&auto=format&fit=crop" alt="Interior" width={900} height={600} className="object-contain w-full h-56 lg:h-full rounded-r-2xl" />
          </div>
          <div className="p-8 flex-1 flex flex-col justify-center gap-4">
            <div className="h-1 w-12 bg-yellow-400 rounded" />
            <h3 className="text-2xl font-extrabold text-gray-900">Interior</h3>
            <p className="text-gray-600">Pellentesque eu nibh eget mauris congue mattis mattis nec tellus.</p>
            <div>
              <button className="mt-4 px-5 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 inline-flex items-center gap-2">
                See products <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
