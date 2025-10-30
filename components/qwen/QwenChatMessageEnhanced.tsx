"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type QwenMessage } from "@/types/qwen";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  User,
  Bot,
  Brain,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  Zap,
  BookOpen,
} from "lucide-react";
import { QwenRAGInfo } from "./QwenRAGInfo";

interface QwenChatMessageEnhancedProps {
  message: QwenMessage;
  isLoading?: boolean;
}

export function QwenChatMessageEnhanced({
  message,
  isLoading,
}: QwenChatMessageEnhancedProps) {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const isUser = message.role === "user";

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(timestamp);
  };

  const getModeIcon = () => {
    switch (message.mode) {
      case "rag":
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bot className="w-4 h-4 text-blue-400" />;
    }
  };

  const getModeColor = () => {
    switch (message.mode) {
      case "rag":
        return "from-emerald-500/20 to-teal-500/20 border-emerald-500/30";
      default:
        return "from-blue-500/20 to-indigo-500/20 border-blue-500/30";
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <Card className="max-w-3xl bg-linear-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 backdrop-blur-sm shadow-lg shadow-indigo-500/10">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-white">You</span>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div className="markdown-content prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    children={message.content || "..."}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <Card
        className={`max-w-4xl bg-linear-to-br ${getModeColor()} backdrop-blur-sm shadow-lg`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg border border-gray-600/50">
                <Bot className="w-5 h-5 text-gray-300" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">Qwen Assistant</span>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800/50 border border-gray-600/50">
                    {getModeIcon()}
                    <span className="text-xs font-medium text-gray-300 capitalize">
                      {message.mode?.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(message.timestamp)}
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span className="text-xs text-blue-300">Thinking...</span>
                  </div>
                )}
              </div>

              {/* Thinking Content */}
              {message.thinking_content && (
                <Collapsible
                  open={isThinkingExpanded}
                  onOpenChange={setIsThinkingExpanded}
                  className="mb-6"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-3 w-full justify-between bg-gray-800/30 hover:bg-gray-700/40 border border-gray-600/30 rounded-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">
                          View Thinking Process
                        </span>
                      </div>
                      {isThinkingExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <Card className="bg-gray-800/30 border border-purple-500/20 backdrop-blur">
                      <ScrollArea className="max-h-80">
                        <div className="p-4">
                          <div className="markdown-content prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              children={message.thinking_content || "..."}
                            />
                          </div>
                        </div>
                      </ScrollArea>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Main Content */}
              <div className="markdown-content prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  children={
                    message.content ||
                    (isLoading ? "Generating response..." : "...")
                  }
                />
              </div>

              {/* Metadata */}
              {(message.token_usage || message.generation_time) && (
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    {message.token_usage && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>
                          {message.token_usage.prompt_tokens} in,{" "}
                          {message.token_usage.completion_tokens} out
                        </span>
                      </div>
                    )}
                    {message.generation_time && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{message.generation_time.toFixed(2)}s</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
