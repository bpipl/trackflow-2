
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

type PageLayoutProps = {
  title: string;
  children: React.ReactNode;
  userRole?: 'admin' | 'user';
  onLogout?: () => void;
};

export const PageLayout = ({ 
  title, 
  children, 
  userRole = 'user',
  onLogout = () => {}
}: PageLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        userRole={userRole} 
        onLogout={onLogout} 
        isSidebarOpen={isSidebarOpen} 
        onCloseSidebar={() => setIsSidebarOpen(false)} 
      />
      <div className="flex flex-1 flex-col md:pl-64">
        <Header title={title} onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
