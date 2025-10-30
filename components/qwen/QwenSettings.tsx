"use client";

import { useState } from "react";
import {
  QwenSettings as QwenSettingsType,
  QwenChatMode,
  ThinkingMode,
} from "@/types/qwen";
import { cn } from "@/lib/utils";
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Brain,
  Thermometer,
  Hash,
  Search,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface QwenSettingsProps {
  settings: QwenSettingsType;
  onChange: (settings: QwenSettingsType) => void;
  className?: string;
}

export function QwenSettings({
  settings,
  onChange,
  className,
}: QwenSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Default settings
  const getDefaultSettings = (): QwenSettingsType => ({
    mode: settings.mode,
    basic: {
      thinking_mode: ThinkingMode.ENABLED,
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.9,
      top_k: 50,
      system_message: undefined,
    },
    rag: {
      thinking_mode: ThinkingMode.ENABLED,
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.9,
      top_k: 5,
      similarity_threshold: 0.7,
    },
  });

  const resetToDefaults = () => {
    onChange(getDefaultSettings());
  };

  const updateBasicSettings = (updates: Partial<QwenSettingsType["basic"]>) => {
    onChange({
      ...settings,
      basic: { ...settings.basic, ...updates },
    });
  };

  const updateRAGSettings = (updates: Partial<QwenSettingsType["rag"]>) => {
    onChange({
      ...settings,
      rag: { ...settings.rag, ...updates },
    });
  };

  const currentSettings =
    settings.mode === QwenChatMode.BASIC ? settings.basic : settings.rag;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isExpanded && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="h-7 px-2 text-xs border-gray-600 hover:border-gray-500"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Settings Panel */}
      {isExpanded && (
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30 space-y-6">
          {/* Thinking Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <Label className="text-sm font-medium text-gray-300">
                Thinking Mode
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ThinkingMode).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    if (settings.mode === QwenChatMode.BASIC) {
                      updateBasicSettings({ thinking_mode: mode });
                    } else {
                      updateRAGSettings({ thinking_mode: mode });
                    }
                  }}
                  className={cn(
                    "px-3 py-2 text-xs rounded-md border transition-colors",
                    currentSettings.thinking_mode === mode
                      ? "border-purple-500 bg-purple-500/10 text-purple-300"
                      : "border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                  )}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <Label className="text-sm font-medium text-gray-300">
                Temperature: {currentSettings.temperature}
              </Label>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={currentSettings.temperature}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (settings.mode === QwenChatMode.BASIC) {
                  updateBasicSettings({ temperature: value });
                } else {
                  updateRAGSettings({ temperature: value });
                }
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>More focused</span>
              <span>More creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-400" />
              <Label className="text-sm font-medium text-gray-300">
                Max Tokens
              </Label>
            </div>
            <input
              type="number"
              min="100"
              max="32768"
              step="100"
              value={currentSettings.max_tokens}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (settings.mode === QwenChatMode.BASIC) {
                  updateBasicSettings({ max_tokens: value });
                } else {
                  updateRAGSettings({ max_tokens: value });
                }
              }}
              className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
            />
          </div>

          {/* RAG-specific settings */}
          {settings.mode === QwenChatMode.RAG && (
            <>
              {/* Top K Documents */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-green-400" />
                  <Label className="text-sm font-medium text-gray-300">
                    Documents to Retrieve: {settings.rag.top_k}
                  </Label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={settings.rag.top_k}
                  onChange={(e) => {
                    updateRAGSettings({ top_k: parseInt(e.target.value) });
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 doc</span>
                  <span>20 docs</span>
                </div>
              </div>

              {/* Similarity Threshold */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-green-400" />
                  <Label className="text-sm font-medium text-gray-300">
                    Similarity Threshold: {settings.rag.similarity_threshold}
                  </Label>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.rag.similarity_threshold}
                  onChange={(e) => {
                    updateRAGSettings({
                      similarity_threshold: parseFloat(e.target.value),
                    });
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Less strict</span>
                  <span>More strict</span>
                </div>
              </div>
            </>
          )}

          {/* Basic-specific settings */}
          {settings.mode === QwenChatMode.BASIC && (
            <>
              {/* System Message */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <Label className="text-sm font-medium text-gray-300">
                    System Message
                  </Label>
                </div>
                <textarea
                  value={settings.basic.system_message || ""}
                  onChange={(e) => {
                    updateBasicSettings({
                      system_message: e.target.value || undefined,
                    });
                  }}
                  placeholder="Optional system instruction for the AI..."
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white resize-none"
                  rows={3}
                />
              </div>

              {/* Top P */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-400" />
                  <Label className="text-sm font-medium text-gray-300">
                    Top P: {currentSettings.top_p}
                  </Label>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={currentSettings.top_p}
                  onChange={(e) => {
                    updateBasicSettings({ top_p: parseFloat(e.target.value) });
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Top K */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-400" />
                  <Label className="text-sm font-medium text-gray-300">
                    Top K: {currentSettings.top_k}
                  </Label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={currentSettings.top_k}
                  onChange={(e) => {
                    updateBasicSettings({ top_k: parseInt(e.target.value) });
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
