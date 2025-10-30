"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Brain,
  Home,
  MessageSquare,
  FileText,
  Sparkles,
  Bot,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    description: "Main dashboard",
  },
  {
    href: "/qwen",
    label: "Qwen",
    icon: Bot,
    description: "Basic Qwen chat",
  },
  {
    href: "/qwen-chat",
    label: "Qwen Enhanced",
    icon: MessageSquare,
    description: "Enhanced Qwen chat",
  },
  {
    href: "/gemini",
    label: "Gemini",
    icon: Sparkles,
    description: "Google Gemini chat",
  },
  {
    href: "/rag",
    label: "RAG Chat",
    icon: FileText,
    description: "Retrieval augmented generation",
  },
];

export function SharedNavigation() {
  const pathname = usePathname();

  return (
    <header className="w-full z-50 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-xl shadow-xl">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative p-2 rounded-lg bg-linear-to-br from-indigo-500/30 to-purple-600/30 shadow-lg">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI Chat Hub
              </h1>
              <p className="text-xs text-gray-400">Multiple AI Models</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "text-gray-400 hover:text-indigo-300 hover:bg-gray-800/50"
                  )}
                  title={item.description}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

// Health Indicator Component (reusable)
interface HealthIndicatorProps {
  status?: "healthy" | "unhealthy" | "checking";
  service?: string;
}

export function HealthIndicator({
  status = "checking",
  service = "Service",
}: HealthIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "unhealthy":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "healthy":
        return "●";
      case "unhealthy":
        return "●";
      default:
        return "○";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium",
        getStatusColor()
      )}
    >
      <span className="animate-pulse">{getStatusIcon()}</span>
      <span>
        {service} {status}
      </span>
    </div>
  );
}
