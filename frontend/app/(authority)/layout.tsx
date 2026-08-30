import React from 'react';
import AuthorityHeader from '@/components/authority/AuthorityHeader';
import AuthoritySidebar from '@/components/authority/AuthoritySidebar';
import LiveAlertBanner from '@/components/authority/LiveAlertBanner';
import ChatbotLogoWidget from '@/components/authority/ChatbotLogoWidget';

export const metadata = {
  title: 'WariVaani | Authority Control Room & Command Center',
  description: 'Government control room dashboard for Pandharpur Wari emergency & logistics management',
};

export default function AuthorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased relative">
      {/* Top Government Header */}
      <AuthorityHeader />

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-1 relative">
        <AuthoritySidebar />
        
        {/* Real-time WebSocket Alert Banner */}
        <LiveAlertBanner />

        {/* Operational Page Canvas */}
        <main className="flex-1 bg-[#f8fafc] overflow-y-auto p-6 min-w-0">
          {children}
        </main>
      </div>

      {/* Floating Chatbot & WariVaani Logo Icon Widget */}
      <ChatbotLogoWidget />
    </div>
  );
}
