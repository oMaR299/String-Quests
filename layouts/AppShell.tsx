import React from 'react';
import { Outlet } from 'react-router-dom';
import { PlatformNavbar } from './PlatformNavbar';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col h-screen font-cairo overflow-hidden">
      <PlatformNavbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />

          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
