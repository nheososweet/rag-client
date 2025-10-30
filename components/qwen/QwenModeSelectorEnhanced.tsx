"use client";

import { QwenChatMode } from "@/types/qwen";
import { cn } from "@/lib/utils";
import { MessageSquare, Database, Info, Sparkles, Zap } from "lucide-react";

interface QwenModeSelectorEnhancedProps {
  mode: QwenChatMode;
  onChange: (mode: QwenChatMode) => void;
  className?: string;
}

export function QwenModeSelectorEnhanced({
  mode,
  onChange,
  className,
}: QwenModeSelectorEnhancedProps) {
  const modes = [
    {
      value: QwenChatMode.BASIC,
      label: "Basic Chat",
      description: "Direct conversation with Qwen model",
      icon: MessageSquare,
      color: "indigo",
      gradient: "from-indigo-500 to-purple-600",
      features: ["Fast responses", "System prompts", "Custom parameters"],
    },
    {
      value: QwenChatMode.RAG,
      label: "RAG Chat",
      description: "Chat with document retrieval and context",
      icon: Database,
      color: "indigo",
      gradient: "from-indigo-500 to-purple-600",
      features: ["Document search", "Context-aware", "Source citations"],
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20">
          <Info className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Chat Mode</h3>
          <p className="text-xs text-gray-400">Choose your interaction style</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-4">
        {modes.map((modeOption) => {
          const Icon = modeOption.icon;
          const isSelected = mode === modeOption.value;

          return (
            <button
              key={modeOption.value}
              onClick={() => onChange(modeOption.value)}
              className={cn(
                "relative w-full p-6 rounded-2xl border transition-all duration-500 group overflow-hidden",
                "text-left hover:scale-[1.02] hover:shadow-2xl",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900",
                isSelected
                  ? "border-indigo-400/50 bg-linear-to-br from-indigo-500/20 via-purple-500/15 to-indigo-600/20 ring-indigo-400/30 shadow-lg shadow-indigo-500/25"
                  : "border-gray-700/50 bg-linear-to-br from-gray-800/40 to-gray-900/60 hover:border-indigo-500/50 hover:from-indigo-900/20 hover:to-purple-900/30"
              )}
            >
              {/* Animated background effect */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-30",
                  "bg-linear-to-r from-indigo-400/20 via-purple-500/15 to-indigo-600/20"
                )}
              />

              {/* Sparkle effect for selected */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <Sparkles
                    className={cn(
                      "w-5 h-5 animate-pulse",
                      modeOption.color === "cyan"
                        ? "text-cyan-400"
                        : "text-emerald-400"
                    )}
                  />
                </div>
              )}

              {/* Content */}
              <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                      isSelected
                        ? "bg-linear-to-br from-indigo-500/30 to-purple-600/30 shadow-lg shadow-indigo-500/25"
                        : "bg-gray-700/50 group-hover:bg-indigo-800/30"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 transition-colors duration-300",
                        isSelected
                          ? "text-indigo-300"
                          : "text-gray-400 group-hover:text-indigo-300"
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          "text-lg font-bold transition-colors duration-300",
                          isSelected
                            ? "text-white"
                            : "text-gray-300 group-hover:text-indigo-300"
                        )}
                      >
                        {modeOption.label}
                      </h4>
                      {isSelected && (
                        <div
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            modeOption.color === "cyan"
                              ? "bg-cyan-500/30 text-cyan-300"
                              : "bg-emerald-500/30 text-emerald-300"
                          )}
                        >
                          Active
                        </div>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed transition-colors duration-300 mt-1",
                        isSelected
                          ? "text-gray-300"
                          : "text-gray-500 group-hover:text-gray-400"
                      )}
                    >
                      {modeOption.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {modeOption.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Zap
                        className={cn(
                          "w-3 h-3",
                          isSelected
                            ? modeOption.color === "cyan"
                              ? "text-cyan-400"
                              : "text-emerald-400"
                            : "text-gray-500 group-hover:text-indigo-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs transition-colors duration-300",
                          isSelected
                            ? "text-gray-300"
                            : "text-gray-500 group-hover:text-indigo-400"
                        )}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom gradient line */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 transition-all duration-500",
                  isSelected
                    ? "bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-600"
                    : "bg-gray-700/30 group-hover:bg-gray-600/50"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Current mode indicator */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50">
        <div
          className={cn(
            (className =
              "w-3 h-3 rounded-full animate-pulse bg-indigo-400 shadow-lg shadow-indigo-400/50")
          )}
        />
        <span className="text-sm text-gray-300">
          Current mode:{" "}
          <span className="font-semibold text-white">
            {mode === QwenChatMode.BASIC ? "Basic Chat" : "RAG Chat"}
          </span>
        </span>
      </div>
    </div>
  );
}
