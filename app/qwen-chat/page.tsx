"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  QwenMessage,
  QwenChatMode,
  QwenSettings as QwenSettingsType,
  ThinkingMode,
  QwenQueryRequest,
  QwenRAGQueryRequest,
  QwenStreamChunk,
  QwenRAGStreamChunk,
} from "@/types/qwen";
import {
  qwenStreamGeneric,
  QwenAPIError,
  qwenHealthCheck,
} from "@/lib/api/qwen";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  Brain,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Home,
  MessageSquare,
  FileText,
} from "lucide-react";

// Components
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/ui/chat-layout";
import { HealthIndicator } from "@/components/ui/shared-nav";
import { QwenModeSelectorEnhanced } from "@/components/qwen/QwenModeSelectorEnhanced";
import { QwenSettingsEnhanced } from "@/components/qwen/QwenSettingsEnhanced";
import { QwenChatMessageEnhanced } from "@/components/qwen/QwenChatMessageEnhanced";

export default function QwenChatPage() {
  // Chat state
  const [messages, setMessages] = useState<QwenMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<QwenSettingsType>({
    mode: QwenChatMode.BASIC,
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

  // Health check state
  const [healthStatus, setHealthStatus] = useState<
    "checking" | "healthy" | "unhealthy" | "error"
  >("checking");

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Health check on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthStatus("checking");
    try {
      const health = await qwenHealthCheck();
      setHealthStatus(health.available ? "healthy" : "unhealthy");
    } catch {
      setHealthStatus("error");
    }
  };

  // Handle mode change
  const handleModeChange = (mode: QwenChatMode) => {
    setSettings((prev) => ({ ...prev, mode }));
  };

  // Build request based on current settings
  const buildRequest = (
    question: string
  ): QwenQueryRequest | QwenRAGQueryRequest => {
    const currentSettings =
      settings.mode === QwenChatMode.BASIC ? settings.basic : settings.rag;

    const baseRequest = {
      question,
      thinking_mode: currentSettings.thinking_mode,
      temperature: currentSettings.temperature,
      max_tokens: currentSettings.max_tokens,
      top_p: currentSettings.top_p,
    };

    if (settings.mode === QwenChatMode.BASIC) {
      return {
        ...baseRequest,
        top_k: settings.basic.top_k,
        system_message: settings.basic.system_message,
        context: undefined,
      } as QwenQueryRequest;
    } else {
      return {
        ...baseRequest,
        top_k: settings.rag.top_k,
        similarity_threshold: settings.rag.similarity_threshold,
      } as QwenRAGQueryRequest;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;
    if (healthStatus !== "healthy") {
      alert("Qwen server is not available. Please check the connection.");
      return;
    }

    // Create user message
    const userMessage: QwenMessage = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      mode: settings.mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantId = uuidv4();
    const assistantMessage: QwenMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      thinking_content: "",
      timestamp: new Date(),
      mode: settings.mode,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Build request
      const request = buildRequest(userMessage.content);

      // Stream response
      const generator = qwenStreamGeneric(settings.mode, request);

      let accumulatedContent = "";
      let accumulatedThinking = "";
      let retrievedChunks: any = undefined;
      let retrievalStats: any = undefined;
      let tokenUsage = undefined;
      let finishReason = undefined;
      let generationTime = undefined;

      for await (const chunk of generator) {
        // Handle different chunk types
        if (chunk.type === "retrieval" && "retrieved_chunks" in chunk) {
          const ragChunk = chunk as QwenRAGStreamChunk;
          retrievedChunks = ragChunk.retrieved_chunks;
          retrievalStats = ragChunk.retrieval_stats;
        } else if (chunk.type === "thinking") {
          accumulatedThinking += chunk.thinking_content;
        } else if (chunk.type === "content") {
          accumulatedContent += chunk.content;
        } else if (chunk.type === "finish") {
          finishReason = chunk.finish_reason;
          break;
        } else if (chunk.type === "error") {
          throw new Error(chunk.content);
        }

        // Update message in real-time
        setMessages((prev) => {
          const newMessages = [...prev];
          const assistantMsg = newMessages.find((m) => m.id === assistantId);

          if (assistantMsg) {
            assistantMsg.content = accumulatedContent;
            assistantMsg.thinking_content = accumulatedThinking;
            assistantMsg.retrieved_chunks = retrievedChunks;
            assistantMsg.retrieval_stats = retrievalStats;
          }

          return newMessages;
        });
      }

      // Final update with completion data
      setMessages((prev) => {
        const newMessages = [...prev];
        const assistantMsg = newMessages.find((m) => m.id === assistantId);

        if (assistantMsg) {
          assistantMsg.finish_reason = finishReason;
          assistantMsg.token_usage = tokenUsage;
          assistantMsg.generation_time = generationTime;
        }

        return newMessages;
      });
    } catch (error) {
      console.error("Chat error:", error);

      // Remove failed assistant message
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));

      // Show error message
      const errorMessage: QwenMessage = {
        id: uuidv4(),
        role: "assistant",
        content: `**Error**: ${
          error instanceof QwenAPIError
            ? error.message
            : "An unexpected error occurred"
        }`,
        timestamp: new Date(),
        mode: settings.mode,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Health status indicator
  const HealthIndicator = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={checkHealth}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-gray-800"
        disabled={healthStatus === "checking"}
      >
        {healthStatus === "checking" ? (
          <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
        ) : healthStatus === "healthy" ? (
          <CheckCircle className="w-3 h-3 text-green-500" />
        ) : healthStatus === "unhealthy" ? (
          <AlertCircle className="w-3 h-3 text-yellow-500" />
        ) : (
          <XCircle className="w-3 h-3 text-red-500" />
        )}

        <span
          className={cn(
            "font-medium",
            healthStatus === "healthy"
              ? "text-green-400"
              : healthStatus === "unhealthy"
              ? "text-yellow-400"
              : healthStatus === "error"
              ? "text-red-400"
              : "text-gray-400"
          )}
        >
          {healthStatus === "checking"
            ? "Checking..."
            : healthStatus === "healthy"
            ? "Qwen Online"
            : healthStatus === "unhealthy"
            ? "Qwen Offline"
            : "Connection Error"}
        </span>
      </button>
    </div>
  );

  return (
    <ChatLayout>
      {/* Settings Sidebar */}
      <aside className="w-80 border-r border-gray-700/50 bg-gray-900/50 backdrop-blur-xl p-6 space-y-6 overflow-y-auto">
        <QwenModeSelectorEnhanced
          mode={settings.mode}
          onChange={handleModeChange}
        />

        <QwenSettingsEnhanced settings={settings} onChange={setSettings} />

        {/* Health Status - TODO: Fix props */}
        <div className="pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Qwen API {healthStatus}
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-gray-900/30">
        {/* Messages */}
        <ScrollArea className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="relative p-6 rounded-full bg-linear-to-br from-indigo-500/30 to-purple-600/30 mb-8 shadow-2xl shadow-indigo-500/25">
                  <Brain className="w-16 h-16 text-indigo-300" />
                  <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-pulse"></div>
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Welcome to Qwen Chat
                </h2>
                <p className="text-gray-300 max-w-md mb-8 leading-relaxed">
                  Choose your chat mode and start a conversation. Qwen can show
                  its thinking process and retrieve relevant documents when in
                  RAG mode.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 backdrop-blur">
                    💭 Thinking Mode
                  </span>
                  <span className="px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 backdrop-blur">
                    📚 Document Retrieval
                  </span>
                  <span className="px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 backdrop-blur">
                    ⚡ Real-time Streaming
                  </span>
                </div>
              </div>
            )}

            {/* Message List */}
            {messages.map((message, index) => (
              <QwenChatMessageEnhanced
                key={message.id}
                message={message}
                isLoading={
                  isLoading &&
                  index === messages.length - 1 &&
                  message.role === "assistant"
                }
              />
            ))}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>

        {/* Input Form */}
        <footer className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-xl p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                ref={inputRef}
                type="text"
                placeholder={
                  healthStatus !== "healthy"
                    ? "Qwen server is not available..."
                    : `Ask Qwen something... (${settings.mode} mode)`
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || healthStatus !== "healthy"}
                className="flex-1 h-12 bg-gray-800/70 border border-gray-600/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 rounded-lg text-white placeholder:text-gray-400 transition-all duration-200"
              />

              <Button
                type="submit"
                disabled={
                  isLoading || !input.trim() || healthStatus !== "healthy"
                }
                className="h-12 px-6 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </div>
                )}
              </Button>
            </form>
          </div>
        </footer>
      </section>
    </ChatLayout>
  );
}
