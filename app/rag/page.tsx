"use client";

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Imports từ shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Loader2,
  MessageCircle,
  Bot,
  User,
  Copy,
  Check,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import { cn } from "@/lib/utils";

// --- Định nghĩa Types cho RAG ---
interface Source {
  document_id: number;
  chunk_id: string;
  content: string;
  similarity_score: number;
  metadata: {
    filename?: string;
    chunk_index?: number;
    total_chunks?: number;
    [key: string]: any;
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Source[];
  model_used?: string;
}

// URL API RAG
const RAG_API_URL = "http://127.0.0.1:8000/api/v1/rag/query";

// --- Component Chat RAG với Streaming ---
export default function RAGChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Hàm xử lý copy
  const handleCopy = (text: string, messageId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      }).catch(err => {
        console.error('Lỗi không thể copy: ', err);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      } catch (err) {
        console.error('Fallback copy error: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Logic RAG Query với STREAMING
  const sendRAGQuery = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    setIsLoading(true);
    setInput('');

    // 1. Tin nhắn người dùng
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedQuery,
      timestamp: Date.now(),
    };

    // 2. Placeholder cho AI
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

    setCopiedMessageId(null);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);

    try {
      const response = await fetch(RAG_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ 
          question: trimmedQuery,
          stream: true, // ✅ BẬT STREAMING
          top_k: 5,
          use_agentic: false,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Xử lý SSE stream
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let buffer = '';
      let retrievedSources: Source[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split('\n\n');

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith('event: done')) continue;

          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (!data || data === '{}') continue;

            try {
              const chunk = JSON.parse(data);

              // ✅ Xử lý chunks (sources) - được gửi đầu tiên
              if (chunk.type === 'chunks' && chunk.chunks) {
                retrievedSources = chunk.chunks.map((c: any) => ({
                  document_id: c.document_id || 0,
                  chunk_id: c.chunk_id || '',
                  content: c.content || '',
                  similarity_score: c.score || 0,
                  metadata: {
                    filename: c.document_filename || c.doc_metadata?.filename || 'Unknown',
                    chunk_index: c.doc_metadata?.chunk_index || 0,
                    total_chunks: c.doc_metadata?.total_chunks || 1,
                    ...c.doc_metadata
                  }
                }));
                
                // Cập nhật sources vào message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, sources: retrievedSources }
                      : msg
                  )
                );
              }
              // ✅ Xử lý content chunks (answer streaming)
              else if (chunk.type === 'content' && chunk.content) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { 
                          ...msg, 
                          content: msg.content + chunk.content,
                          sources: retrievedSources.length > 0 ? retrievedSources : msg.sources
                        }
                      : msg
                  )
                );
              }
              // ✅ Xử lý usage (metadata)
              else if (chunk.type === 'done' && chunk.usage) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, model_used: chunk.model }
                      : msg
                  )
                );
              }
              // ✅ Xử lý lỗi
              else if (chunk.type === 'error') {
                console.error("Stream error chunk:", chunk.content);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: `${msg.content}\n\n[LỖI: ${chunk.content}]` }
                      : msg
                  )
                );
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data chunk:", data, parseError);
            }
          }
        }
        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      console.error("RAG stream failed:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `[LỖI KẾT NỐI: ${error instanceof Error ? error.message : String(error)}]`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendRAGQuery(input);
  };

  // --- Styles ---
  const SpecialEffectsStyle = () => (
    <style>{`
      @keyframes aurora {
        from { background-position: 0% 50%; }
        to { background-position: 100% 50%; }
      }

      .aurora-bg::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
        background: radial-gradient(at 20% 30%, hsla(271, 100%, 70%, 0.1) 0px, transparent 50%),
                    radial-gradient(at 80% 70%, hsla(190, 100%, 70%, 0.1) 0px, transparent 50%);
        filter: blur(80px);
        animation: aurora 15s linear infinite alternate;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .animate-fade-in {
        animation: fadeIn 0.4s ease-out forwards;
      }

      /* Markdown styles */
      .markdown-content p { margin-bottom: 0.5rem; }
      .markdown-content p:last-child { margin-bottom: 0; }
      .markdown-content h1 { font-size: 1.5em; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; border-bottom: 1px solid #4b5563; padding-bottom: 0.25rem;}
      .markdown-content h2 { font-size: 1.25em; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
      .markdown-content h3 { font-size: 1.1em; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
      .markdown-content ul { list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
      .markdown-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
      .markdown-content li { margin-bottom: 0.25rem; }
      .markdown-content p > code,
      .markdown-content li > code {
        background-color: #374151;
        padding: 0.15rem 0.4rem;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.9em;
        color: #e5e7eb;
      }
      .markdown-content pre {
        background-color: #111827;
        padding: 0.75rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        border: 1px solid #374151;
      }
      .markdown-content pre code {
        background-color: transparent !important;
        padding: 0 !important;
        border: none !important;
        color: inherit !important;
        font-size: 0.875em !important;
        font-family: monospace !important;
      }
      .markdown-content blockquote {
        border-left: 4px solid #4b5563;
        padding-left: 1rem;
        color: #9ca3af;
        margin: 0.5rem 0 0.5rem 0.25rem;
        font-style: italic;
      }
      .markdown-content a {
        color: #60a5fa;
        text-decoration: underline;
      }
    `}</style>
  );

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-gray-100 relative overflow-hidden aurora-bg">
      <SpecialEffectsStyle />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              RAG Document Assistant (Streaming)
            </h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 pb-8">
            {messages.length === 0 && !isLoading && (
              <RAGWelcome onPromptClick={sendRAGQuery} />
            )}

            <div className="space-y-6">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isLoading={
                    isLoading &&
                    msg.role === 'assistant' &&
                    index === messages.length - 1
                  }
                  copiedState={copiedMessageId === msg.id}
                  onCopy={() => handleCopy(msg.content, msg.id)}
                />
              ))}
            </div>

            <div ref={messagesEndRef} className="h-1 w-full" />
          </div>
        </ScrollArea>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-gray-950 to-transparent" />
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 z-10 border-t border-gray-800 bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-gray-900/50">
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          <form onSubmit={handleFormSubmit} className="flex gap-4">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về tài liệu của bạn..."
              disabled={isLoading}
              className="flex-1 h-12 bg-gray-800/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 text-base"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 px-6 bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors min-w-[100px] disabled:opacity-50"
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
    </div>
  );
}

// --- Component Tin Nhắn ---
interface MessageItemProps {
  message: Message;
  isLoading: boolean;
  copiedState: boolean;
  onCopy: () => void;
}

const MarkdownRenderer = React.memo(({ content }: { content: string }) => {
  return (
    <div className="markdown-content prose prose-invert prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} children={content || "..."} />
    </div>
  );
});
MarkdownRenderer.displayName = "MarkdownRenderer";

function MessageItem({ message, isLoading, copiedState, onCopy }: MessageItemProps) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  const time = new Date(message.timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const showLoading = isLoading && !isUser && !message.content;

  return (
    <div className={cn(
      "group relative flex w-full gap-3 px-0 animate-fade-in",
      isUser ? "flex-row-reverse ml-auto sm:max-w-[85%]" : "flex-row sm:max-w-full"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full self-start",
        isUser
          ? "bg-blue-600/15 ring-2 ring-blue-600/30"
          : "bg-purple-600/15 ring-2 ring-purple-600/30"
      )}>
        {isUser ? (
          <User className="h-5 w-5 text-blue-400" />
        ) : (
          <Bot className="h-5 w-5 text-purple-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col flex-1", isUser ? "items-end" : "items-start")}>
        {/* Main message bubble */}
        <div className={cn(
          "relative rounded-xl px-4 py-3 text-sm leading-relaxed ring-1 shadow-lg",
          isUser
            ? "bg-blue-600 text-blue-50 w-fit ring-blue-600/50 rounded-br-sm"
            : "bg-gray-800/80 ring-gray-700 text-gray-100 rounded-tl-sm w-full"
        )}>
          {showLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Sources Section - Chỉ hiển thị cho assistant */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 w-full">
            <Button
              onClick={() => setShowSources(!showSources)}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              {message.sources.length} nguồn tham khảo
              {showSources ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>

            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources.map((source, idx) => (
                  <SourceCard key={idx} source={source} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <time className={cn(
          "text-[10px] text-gray-500 mt-1",
          isUser ? "mr-1" : "ml-1"
        )}>
          {showLoading ? "Đang tìm kiếm tài liệu..." : time}
          {message.model_used && !showLoading && (
            <span className="ml-2 text-purple-500">• {message.model_used}</span>
          )}
        </time>
      </div>

      {/* Copy Button */}
      {!isUser && !isLoading && message.content && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0 -right-4">
          <Button
            onClick={onCopy}
            size="icon"
            variant="ghost"
            title="Copy message"
            className={`h-7 w-7 rounded-full cursor-pointer ${
              copiedState
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            {copiedState ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// --- Component Source Card ---
interface SourceCardProps {
  source: Source;
  index: number;
}

function SourceCard({ source, index }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const displayContent = expanded 
    ? source.content 
    : source.content.slice(0, 150) + (source.content.length > 150 ? '...' : '');

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-xs">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded font-mono">
            #{index + 1}
          </span>
          <span className="text-gray-400">
            {source.metadata.filename || `Document ${source.document_id}`}
          </span>
        </div>
        <span className="text-green-400 font-mono">
          {(source.similarity_score * 100).toFixed(1)}%
        </span>
      </div>

      <p className="text-gray-300 leading-relaxed mb-2">
        {displayContent}
      </p>

      {source.content.length > 150 && (
        <Button
          onClick={() => setExpanded(!expanded)}
          variant="ghost"
          size="sm"
          className="text-xs text-purple-400 hover:text-purple-300 p-0 h-auto"
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </Button>
      )}

      <div className="mt-2 flex gap-3 text-[10px] text-gray-500">
        <span>Chunk {(source.metadata.chunk_index || 0) + 1}/{source.metadata.total_chunks || 1}</span>
        <span>•</span>
        <span>Chunk ID: {source.chunk_id}</span>
      </div>
    </div>
  );
}

// --- Component Welcome ---
const RAGWelcome = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
  const prompts = [
    "Tìm thông tin về điều khoản thanh toán trong hợp đồng",
    "Tóm tắt các điều khoản chính trong tài liệu",
    "Giải thích về chính sách bảo mật",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
      <FileText className="w-16 h-16 mb-6 text-gray-600" />
      <h2 className="text-2xl font-medium text-gray-400 mb-3">
        RAG Document Assistant
      </h2>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        Hỏi bất kỳ điều gì về tài liệu của bạn. Hệ thống sẽ tìm kiếm và trả lời dựa trên nội dung tài liệu với streaming real-time.
      </p>

      {/* Suggested prompts */}
      <div className="flex flex-col gap-2 max-w-2xl w-full">
        {prompts.map((prompt, idx) => (
          <div
            key={idx}
            onClick={() => onPromptClick(prompt)}
            className="p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-left text-sm cursor-pointer hover:bg-gray-700/70 transition-colors"
          >
            <p className="text-gray-300">{prompt}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 mt-8">
        💡 Hệ thống sử dụng RAG với Streaming để trả lời real-time
      </p>
    </div>
  );
};
