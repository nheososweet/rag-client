"use client";

import {
  QwenSettings as QwenSettingsType,
  QwenChatMode,
  ThinkingMode,
} from "@/types/qwen";
import { cn } from "@/lib/utils";
import {
  Settings,
  Brain,
  Thermometer,
  Hash,
  Search,
  MessageSquare,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";

interface QwenSettingsEnhancedProps {
  settings: QwenSettingsType;
  onChange: (settings: QwenSettingsType) => void;
  className?: string;
}

export function QwenSettingsEnhanced({
  settings,
  onChange,
  className,
}: QwenSettingsEnhancedProps) {
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
      <Collapsible>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-indigo-300 hover:bg-gray-800/50 p-0 h-auto"
            >
              <Settings className="w-4 h-4" />
              <span>Advanced Settings</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>

          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="h-7 px-2 text-xs text-gray-400 border-gray-600 hover:border-indigo-500 hover:text-indigo-300 hover:bg-gray-800/50"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        <CollapsibleContent className="mt-4">
          <Card className="border-gray-700 bg-gray-800/30">
            <CardContent className="p-6 space-y-8">
              {/* Thinking Mode */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <Label className="text-sm font-medium text-gray-300">
                    Thinking Mode
                  </Label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ThinkingMode).map((mode) => (
                    <Button
                      key={mode}
                      variant={
                        currentSettings.thinking_mode === mode
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (settings.mode === QwenChatMode.BASIC) {
                          updateBasicSettings({ thinking_mode: mode });
                        } else {
                          updateRAGSettings({ thinking_mode: mode });
                        }
                      }}
                      className={cn(
                        "text-xs h-8",
                        currentSettings.thinking_mode === mode
                          ? "bg-purple-600 hover:bg-purple-500 border-purple-500 text-white"
                          : "text-gray-300 border-gray-600 hover:border-purple-500 hover:text-purple-300 hover:bg-purple-500/10"
                      )}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-indigo-400" />
                    <Label className="text-sm font-medium text-gray-300">
                      Temperature
                    </Label>
                  </div>
                  <span className="text-sm text-indigo-400 font-mono bg-indigo-400/10 px-2 py-1 rounded">
                    {currentSettings.temperature?.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[currentSettings.temperature || 0.7]}
                  onValueChange={(value) => {
                    if (settings.mode === QwenChatMode.BASIC) {
                      updateBasicSettings({ temperature: value[0] });
                    } else {
                      updateRAGSettings({ temperature: value[0] });
                    }
                  }}
                  max={2.0}
                  min={0.1}
                  step={0.1}
                  className="**:[[role=slider]]:bg-indigo-500 **:[[role=slider]]:border-indigo-400"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>More focused (0.1)</span>
                  <span>More creative (2.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-indigo-400" />
                    <Label className="text-sm font-medium text-gray-300">
                      Max Tokens
                    </Label>
                  </div>
                  <span className="text-sm text-indigo-400 font-mono bg-indigo-400/10 px-2 py-1 rounded">
                    {currentSettings.max_tokens}
                  </span>
                </div>
                <Slider
                  value={[currentSettings.max_tokens || 4096]}
                  onValueChange={(value) => {
                    if (settings.mode === QwenChatMode.BASIC) {
                      updateBasicSettings({ max_tokens: value[0] });
                    } else {
                      updateRAGSettings({ max_tokens: value[0] });
                    }
                  }}
                  max={32768}
                  min={100}
                  step={100}
                  className="**:[[role=slider]]:bg-indigo-500 **:[[role=slider]]:border-indigo-400"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>100 tokens</span>
                  <span>32,768 tokens</span>
                </div>
              </div>

              {/* RAG-specific settings */}
              {settings.mode === QwenChatMode.RAG && (
                <>
                  {/* Top K Documents */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-400" />
                        <Label className="text-sm font-medium text-gray-300">
                          Documents to Retrieve
                        </Label>
                      </div>
                      <span className="text-sm text-indigo-400 font-mono bg-indigo-400/10 px-2 py-1 rounded">
                        {settings.rag.top_k}
                      </span>
                    </div>
                    <Slider
                      value={[settings.rag.top_k]}
                      onValueChange={(value) => {
                        updateRAGSettings({ top_k: value[0] });
                      }}
                      max={20}
                      min={1}
                      step={1}
                      className="**:[[role=slider]]:bg-indigo-500 **:[[role=slider]]:border-indigo-400"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 document</span>
                      <span>20 documents</span>
                    </div>
                  </div>

                  {/* Similarity Threshold */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-400" />
                        <Label className="text-sm font-medium text-gray-300">
                          Similarity Threshold
                        </Label>
                      </div>
                      <span className="text-sm text-indigo-400 font-mono bg-indigo-400/10 px-2 py-1 rounded">
                        {settings.rag.similarity_threshold.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[settings.rag.similarity_threshold]}
                      onValueChange={(value) => {
                        updateRAGSettings({ similarity_threshold: value[0] });
                      }}
                      max={1.0}
                      min={0.1}
                      step={0.05}
                      className="**:[[role=slider]]:bg-indigo-500 **:[[role=slider]]:border-indigo-400"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Less strict (0.1)</span>
                      <span>More strict (1.0)</span>
                    </div>
                  </div>
                </>
              )}

              {/* Basic-specific settings */}
              {settings.mode === QwenChatMode.BASIC && (
                <>
                  {/* System Message */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
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
                      className="w-full px-3 py-2 text-sm bg-gray-700/50 border border-gray-600 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white resize-none transition-colors"
                      rows={3}
                    />
                  </div>

                  {/* Top P */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-indigo-400" />
                        <Label className="text-sm font-medium text-gray-300">
                          Top P
                        </Label>
                      </div>
                      <span className="text-sm text-indigo-400 font-mono bg-indigo-400/10 px-2 py-1 rounded">
                        {currentSettings.top_p?.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[currentSettings.top_p || 0.9]}
                      onValueChange={(value) => {
                        updateBasicSettings({ top_p: value[0] });
                      }}
                      max={1.0}
                      min={0.1}
                      step={0.05}
                      className="**:[[role=slider]]:bg-indigo-500 **:[[role=slider]]:border-indigo-400"
                    />
                  </div>

                  {/* Top K */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-indigo-400" />
                        <Label className="text-sm font-medium text-gray-300">
                          Top K
                        </Label>
                      </div>
                      <span className="text-sm text-indigo-400 font-mono bg-indigo-400/10 px-2 py-1 rounded">
                        {currentSettings.top_k}
                      </span>
                    </div>
                    <Slider
                      value={[currentSettings.top_k || 50]}
                      onValueChange={(value) => {
                        updateBasicSettings({ top_k: value[0] });
                      }}
                      max={100}
                      min={1}
                      step={1}
                      className="**:[[role=slider]]:bg-indigo-500 **:[[role=slider]]:border-indigo-400"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
