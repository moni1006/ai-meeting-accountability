import React from 'react';
import { Sidebar } from '@/components/Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="px-4 lg:px-8 py-6 pt-16 lg:pt-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
