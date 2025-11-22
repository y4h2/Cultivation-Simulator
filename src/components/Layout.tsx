import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-800">
        <p>修仙模拟器 - Cultivation Simulator</p>
      </footer>
    </div>
  );
};
