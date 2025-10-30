"use client";

import { QwenMessage, QwenChatMode, ThinkingMode } from "@/types/qwen";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  Brain,
  Loader2,
  Clock,
  Hash,
  MessageSquare,
  Database,
} from "lucide-react";
import { QwenRAGInfo } from "./QwenRAGInfo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface QwenChatMessageProps {
  message: QwenMessage;
  isLoading?: boolean;
  className?: string;
}

export function QwenChatMessage({
  message,
  isLoading,
  className,
}: QwenChatMessageProps) {
  const isUser = message.role === "user";
  const hasThinking =
    message.thinking_content && message.thinking_content.length > 0;
  const isRAGMode = message.mode === QwenChatMode.RAG;

  return (
    <div className={cn("group relative flex w-full gap-4 px-4", className)}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full",
          isUser
            ? "bg-blue-600/15 ring-2 ring-blue-600/30"
            : "bg-indigo-600/15 ring-2 ring-indigo-600/30"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-blue-400" />
        ) : (
          <Bot className="h-5 w-5 text-indigo-400" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-3">
        {/* Message Header */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              isUser ? "text-blue-400" : "text-indigo-400"
            )}
          >
            {isUser ? "You" : "Qwen Assistant"}
          </span>

          {!isUser && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                {isRAGMode ? (
                  <Database className="w-3 h-3" />
                ) : (
                  <MessageSquare className="w-3 h-3" />
                )}
                <span>{isRAGMode ? "RAG" : "Basic"}</span>
              </div>

              {message.generation_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{message.generation_time.toFixed(2)}s</span>
                </div>
              )}

              {message.token_usage?.total_tokens && (
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  <span>{message.token_usage.total_tokens} tokens</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RAG Information (for assistant messages in RAG mode) */}
        {!isUser &&
          isRAGMode &&
          (message.retrieved_chunks || message.retrieval_stats) && (
            <QwenRAGInfo
              retrievedChunks={message.retrieved_chunks}
              retrievalStats={message.retrieval_stats}
            />
          )}

        {/* Thinking Content */}
        {!isUser && hasThinking && (
          <div className="relative rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-yellow-500/20">
              <Brain className="w-4 h-4 text-yellow-500/70" />
              <span className="text-sm font-medium text-yellow-500/70">
                Thinking Process
              </span>
            </div>

            <div className="prose prose-sm prose-invert max-w-none text-yellow-100/80 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.thinking_content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Main Message Content */}
        <div
          className={cn(
            "relative rounded-lg px-4 py-3 ring-1",
            isUser
              ? "bg-blue-600/10 ring-blue-600/25 text-blue-50 ml-auto max-w-[80%]"
              : "bg-gray-900/50 ring-gray-700/50 text-gray-100"
          )}
        >
          {/* Loading indicator */}
          {isLoading && !isUser && (
            <div className="absolute top-3 right-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          )}

          {/* Message text */}
          <div
            className={cn(
              "prose prose-sm prose-invert max-w-none leading-relaxed",
              isUser ? "text-blue-50" : "text-gray-100"
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || (isLoading ? "Thinking..." : "")}
            </ReactMarkdown>
          </div>

          {/* Finish reason */}
          {!isUser &&
            message.finish_reason &&
            message.finish_reason !== "stop" && (
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <span className="text-xs text-gray-500">
                  Finished: {message.finish_reason}
                </span>
              </div>
            )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
