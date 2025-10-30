"use client";

import { ReactNode } from "react";
import { SharedNavigation } from "./shared-nav";

interface ChatLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ChatLayout({ children, className }: ChatLayoutProps) {
  return (
    <div className="h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex flex-col overflow-hidden">
      <SharedNavigation />

      {/* Main content with proper spacing - NO padding top, use margin instead */}
      <main className="flex-1 flex overflow-hidden">{children}</main>
    </div>
  );
}
