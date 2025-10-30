"use client";

import { QwenChatMode } from "@/types/qwen";
import { cn } from "@/lib/utils";
import { MessageSquare, Database, Info } from "lucide-react";

interface QwenModeSelectorProps {
  mode: QwenChatMode;
  onChange: (mode: QwenChatMode) => void;
  className?: string;
}

export function QwenModeSelector({
  mode,
  onChange,
  className,
}: QwenModeSelectorProps) {
  const modes = [
    {
      value: QwenChatMode.BASIC,
      label: "Basic Chat",
      description: "Direct conversation with Qwen model",
      icon: MessageSquare,
      color: "blue",
    },
    {
      value: QwenChatMode.RAG,
      label: "RAG Chat",
      description: "Chat with document retrieval and context",
      icon: Database,
      color: "green",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
        <Info className="w-4 h-4" />
        <span>Chat Mode</span>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map((modeOption) => {
          const Icon = modeOption.icon;
          const isSelected = mode === modeOption.value;

          return (
            <button
              key={modeOption.value}
              onClick={() => onChange(modeOption.value)}
              className={cn(
                "relative p-4 rounded-lg border transition-all duration-200",
                "text-left space-y-2 hover:scale-[1.02]",
                "focus:outline-none focus:ring-2",
                isSelected
                  ? modeOption.color === "blue"
                    ? "border-blue-500 bg-blue-500/10 ring-blue-500/20"
                    : "border-green-500 bg-green-500/10 ring-green-500/20"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div
                  className={cn(
                    "absolute top-2 right-2 w-2 h-2 rounded-full",
                    modeOption.color === "blue" ? "bg-blue-500" : "bg-green-500"
                  )}
                />
              )}

              {/* Icon and Label */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-md",
                    isSelected
                      ? modeOption.color === "blue"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                      : "bg-gray-700/50 text-gray-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-white" : "text-gray-300"
                    )}
                  >
                    {modeOption.label}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p
                className={cn(
                  "text-xs leading-relaxed",
                  isSelected ? "text-gray-300" : "text-gray-500"
                )}
              >
                {modeOption.description}
              </p>

              {/* Mode-specific info */}
              {modeOption.value === QwenChatMode.RAG && (
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
                  • Document retrieval enabled
                  <br />
                  • Context-aware responses
                  <br />• Source citations included
                </div>
              )}

              {modeOption.value === QwenChatMode.BASIC && (
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
                  • Direct model interaction
                  <br />
                  • Faster response times
                  <br />• No document context
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Current mode indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-800/30 border border-gray-700">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            mode === QwenChatMode.BASIC ? "bg-blue-500" : "bg-green-500"
          )}
        />
        <span className="text-xs text-gray-400">
          Current mode:{" "}
          <span className="text-gray-200">
            {mode === QwenChatMode.BASIC ? "Basic Chat" : "RAG Chat"}
          </span>
        </span>
      </div>
    </div>
  );
}
