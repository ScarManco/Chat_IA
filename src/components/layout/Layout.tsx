import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { WatsonAssistant } from '../chat/WatsonAssistant';

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
      <WatsonAssistant />
    </div>
  );
}