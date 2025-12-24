"use client";

import Sidebar from '@/components/Sidebar';
import DashboardMain from '@/components/DashboardMain';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <DashboardMain />
      </main>
    </div>
  );
}
