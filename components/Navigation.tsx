"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, Database, Brain, Bot, Home, Menu } from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "RAG Chat",
    href: "/rag",
    icon: Database,
    description: "Chat with document retrieval",
  },
  {
    name: "Gemini Chat",
    href: "/gemini",
    icon: MessageSquare,
    description: "Google Gemini powered chat",
  },
  {
    name: "Qwen Chat (Legacy)",
    href: "/qwen",
    icon: Bot,
    description: "Original Qwen implementation",
  },
  {
    name: "Qwen Chat",
    href: "/qwen-chat",
    icon: Brain,
    description: "Advanced Qwen with thinking mode & RAG",
    featured: true,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur supports-backdrop-filter:bg-gray-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <Brain className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-xl font-semibold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  AI Assistant
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200",
                      "hover:bg-gray-800/50 hover:scale-105",
                      isActive
                        ? item.featured
                          ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30 shadow-lg"
                          : "bg-gray-800 text-white shadow-md"
                        : "text-gray-400 hover:text-gray-200",
                      item.featured && !isActive && "ring-1 ring-indigo-500/20"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive && item.featured ? "text-indigo-400" : ""
                      )}
                    />

                    <span className="font-medium">{item.name}</span>

                    {item.featured && (
                      <div className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full animate-pulse">
                        NEW
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors",
                      "hover:bg-gray-800/50",
                      isActive
                        ? item.featured
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-gray-200",
                      item.featured && !isActive && "ring-1 ring-indigo-500/20"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isActive && item.featured ? "text-indigo-400" : ""
                      )}
                    />

                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </div>
                      )}
                    </div>

                    {item.featured && (
                      <div className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                        NEW
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
