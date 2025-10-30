"use client"; // Cần thiết cho React Hooks (useState, useEffect)

import React, { useState, useEffect, useRef, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// (Giả sử bạn đã cài: npm install lucide-react react-markdown remark-gfm)
// (Và dùng shadcn add: button, input, avatar, scroll-area)

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatLayout } from "@/components/ui/chat-layout";
import {
  Send,
  Loader2,
  MessageCircle,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

// ✅ THÊM: Import utility từ shadcn (nếu bạn có file này)
// Giả sử bạn có file utils này. Nếu không, bạn có thể xóa dòng này
// và xóa `cn()` khỏi các classNames bên dưới.
import { cn } from "@/lib/utils";

// --- Định nghĩa Types ---
interface Message {
  id: string;
  role: "user" | "model"; // Đổi 'assistant' thành 'model' để khớp Gemini
  content: string;
  timestamp: number;
  usage?: {
    prompt_token_count: number;
    candidates_token_count: number;
    total_token_count: number;
  };
}

interface StreamChunk {
  type: "content" | "error";
  content: string;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

// URL API Gemini (của chúng ta)
const API_URL = "http://127.0.0.1:8080/api/v1/chat/ask";

// --- Component Chat Chính ---
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Logic cuộn (giống UI mẫu)
  useEffect(() => {
    // Cuộn tức thì khi stream để tránh giật
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]); // Chạy mỗi khi tin nhắn (hoặc chunk) thay đổi

  // Hàm xử lý copy
  const handleCopy = (text: string, messageId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedMessageId(messageId);
          setTimeout(() => setCopiedMessageId(null), 2000);
        })
        .catch((err) => {
          console.error("Lỗi không thể copy: ", err);
        });
    } else {
      // Fallback cho môi trường không hỗ trợ navigator.clipboard (như iframe)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      } catch (err) {
        console.error("Fallback copy error: ", err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Logic chat (Sử dụng API Gemini của chúng ta)
  const startChat = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    setIsLoading(true);
    setInput("");

    // 1. Tạo tin nhắn người dùng
    const userMessage: Message = {
      id: Date.now().toString(), // Hoặc dùng uuidv4() nếu bạn đã import
      role: "user",
      content: trimmedQuery,
      timestamp: Date.now(),
    };

    // 2. Tạo ID và timestamp cho tin nhắn AI (sẽ dùng để cập nhật)
    const modelMessageId = (Date.now() + 1).toString(); // Hoặc dùng uuidv4()
    const modelTimestamp = Date.now();

    // 3. Tạo tin nhắn AI RỖNG (placeholder)
    const assistantPlaceholderMessage: Message = {
      id: modelMessageId,
      role: "model",
      content: "", // Bắt đầu rỗng
      timestamp: modelTimestamp,
    };

    // 4. Thêm CẢ HAI tin nhắn vào state CÙNG LÚC
    setMessages((prev) => [...prev, userMessage, assistantPlaceholderMessage]);

    // Reset copied state
    setCopiedMessageId(null);

    // Luôn cuộn xuống khi user gửi tin
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    try {
      const response = await fetch(API_URL, {
        // Gọi API Gemini
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          query: trimmedQuery,
          stream: true,
          history: [],
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split("\n\n");

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith("event: done")) continue;

          if (line.startsWith("data: ")) {
            // Parse response từ backend
            const data = line.substring(6);
            if (!data || data === "{}") continue; // Bỏ qua data rỗng hoặc {}

            try {
              const chunk = JSON.parse(data) as StreamChunk;

              if (chunk.type === "content" && chunk.content) {
                // ✅ THAY ĐỔI: Luôn tìm và cập nhật tin nhắn AI placeholder
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === modelMessageId // Tìm theo ID đã tạo
                      ? {
                          ...msg,
                          content: msg.content + chunk.content, // Nối chunk mới
                          usage: chunk.metadata?.usage
                            ? {
                                prompt_token_count:
                                  chunk.metadata.usage.prompt_tokens,
                                candidates_token_count:
                                  chunk.metadata.usage.completion_tokens,
                                total_token_count:
                                  chunk.metadata.usage.total_tokens,
                              }
                            : msg.usage, // Cập nhật usage
                        }
                      : msg
                  )
                );
              } else if (chunk.type === "error") {
                // Xử lý lỗi từ stream (giữ nguyên)
                console.error("Stream error chunk:", chunk.content);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === modelMessageId
                      ? {
                          ...msg,
                          content: `${msg.content}\n\n[LỖI: ${chunk.content}]`,
                        }
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
      console.error("Fetch stream failed:", error);
      // ✅ THAY ĐỔI: Nếu fetch lỗi, cập nhật tin nhắn AI placeholder thành lỗi
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? {
                ...msg,
                content: `[LỖI KẾT NỐI: ${
                  error instanceof Error ? error.message : String(error)
                }]`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm riêng cho submit từ form
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    startChat(input);
  };

  // --- CSS "Đặc Biệt" (Aurora + Markdown Styles) ---
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

      /* CSS Styles cho react-markdown */
      .markdown-content p { margin-bottom: 0.5rem; }
      .markdown-content p:last-child { margin-bottom: 0; }
      .markdown-content h1 { font-size: 1.5em; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; border-bottom: 1px solid #4b5563; padding-bottom: 0.25rem;}
      .markdown-content h2 { font-size: 1.25em; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
      .markdown-content h3 { font-size: 1.1em; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
      .markdown-content ul { list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
      .markdown-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
      .markdown-content li { margin-bottom: 0.25rem; }
      /* Inline code */
      .markdown-content p > code,
      .markdown-content li > code,
      .markdown-content th > code,
      .markdown-content td > code {
        background-color: #374151; /* bg-gray-700 */
        padding: 0.15rem 0.4rem;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.9em;
        color: #e5e7eb; /* text-gray-200 */
      }
      /* Code block */
      .markdown-content pre {
        background-color: #111827; /* bg-gray-900 */
        padding: 0.75rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        border: 1px solid #374151; /* border-gray-700 */
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
        border-left: 4px solid #4b5563; /* border-gray-600 */
        padding-left: 1rem;
        color: #9ca3af; /* text-gray-400 */
        margin: 0.5rem 0 0.5rem 0.25rem; /* Điều chỉnh margin */
        font-style: italic;
      }
      .markdown-content a {
        color: #60a5fa; /* text-blue-400 */
        text-decoration: underline;
      }
      .markdown-content table {
        width: auto;
        border-collapse: collapse;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .markdown-content th, .markdown-content td {
        border: 1px solid #4b5563; /* border-gray-600 */
        padding: 0.5rem 0.75rem;
      }
      .markdown-content th {
        background-color: #374151; /* bg-gray-700 */
        font-weight: bold;
      }
       .markdown-content ul > li.task-list-item {
        list-style-type: none;
        margin-left: -1.5rem;
      }
      .markdown-content ul > li > input[type="checkbox"] {
         margin-right: 0.5rem;
      }
    `}</style>
  );

  // Render UI
  return (
    <ChatLayout>
      <SpecialEffectsStyle />

      {/* Full width chat area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-900/30">
        <ScrollArea className="h-full">
          {/* ✅ THAY ĐỔI: Thêm pb-8 để footer không che mất tin cuối */}
          <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 pb-8">
            {messages.length === 0 && !isLoading && (
              <ChatWelcome onPromptClick={startChat} />
            )}

            <div className="space-y-6">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isLoading={
                    // ✅ THAY ĐỔI: Truyền isLoading trực tiếp
                    isLoading &&
                    msg.role === "model" &&
                    index === messages.length - 1
                  }
                  copiedState={copiedMessageId === msg.id}
                  onCopy={() => handleCopy(msg.content, msg.id)}
                />
              ))}
            </div>

            {/* Ref cuộn */}
            <div ref={messagesEndRef} className="h-1 w-full" />
          </div>
        </ScrollArea>

        {/* Input Form */}
        <footer className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-xl p-6">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleFormSubmit} className="flex gap-4">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi tôi bất cứ điều gì..."
                disabled={isLoading}
                className="flex-1 h-12 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 text-base"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors min-w-[100px] disabled:opacity-50"
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
    </ChatLayout>
  );
}

// --- Component Tin Nhắn (Theo style UI mẫu) ---
interface MessageItemProps {
  message: Message;
  isLoading: boolean; // Chỉ dùng cho loading indicator
  copiedState: boolean;
  onCopy: () => void;
}

// ✅ THAY ĐỔI: Component render Markdown dùng ReactMarkdown
const MarkdownRenderer = React.memo(({ content }: { content: string }) => {
  return (
    // Class markdown-content dùng style từ SpecialEffectsStyle
    <div className="markdown-content prose prose-invert prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} children={content || "..."} />
    </div>
  );
});
MarkdownRenderer.displayName = "MarkdownRenderer";

function MessageItem({
  message,
  isLoading,
  copiedState,
  onCopy,
}: MessageItemProps) {
  const isUser = message.role === "user";

  const time = new Date(message.timestamp).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Helper function để kiểm tra xem có nên hiển thị loading không
  const showLoading = isLoading && !isUser && !message.content;
  console.log(isLoading, "isLoading");
  console.log(isUser, "isUser");
  console.log(message, "message");
  console.log(showLoading, "showLoading");

  return (
    <div
      className={cn(
        "group relative flex w-full gap-3 px-0 animate-fade-in", // Thêm fade-in ở đây
        isUser
          ? "flex-row-reverse ml-auto sm:max-w-[85%]"
          : "flex-row sm:max-w-[85%]"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full self-start",
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

      {/* Message Wrapper */}
      <div
        className={cn(
          "flex flex-col flex-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Bong bóng tin nhắn */}
        <div
          className={cn(
            "relative rounded-xl px-4 py-3 text-sm leading-relaxed ring-1 shadow-lg",
            isUser
              ? "bg-blue-600 text-blue-50 w-fit ring-blue-600/50 rounded-br-sm"
              : "bg-gray-800/80 ring-gray-700 text-gray-100 rounded-tl-sm w-fit min-w-[50px]" // Thêm min-w cho bot khi loading
          )}
        >
          {/* Nội dung hoặc Loading */}
          {showLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Timestamp */}
        <time
          className={cn(
            `text-[10px] text-gray-500 mt-1`,
            isUser ? "mr-1" : "ml-1"
          )}
        >
          {showLoading ? "Generating..." : time}{" "}
          {/* Hiển thị Generating khi loading */}
        </time>
      </div>

      {/* Nút Copy */}
      {!isUser && !isLoading && message.content && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0 -right-4 ">
          <Button
            onClick={onCopy}
            size="icon"
            variant="ghost"
            title="Copy message"
            className={`h-7 w-7 rounded-full cursor-pointer ${
              copiedState
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 hover:bg-gray-500 text-white"
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

// Component Welcome (Theo UI mẫu)
const ChatWelcome = ({
  onPromptClick,
}: {
  onPromptClick: (prompt: string) => void;
}) => {
  const prompt1 = "Giải thích về Lượng tử máy tính";
  const prompt2 = "Viết hàm Python để đảo ngược chuỗi";

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
      <Bot className="w-16 h-16 mb-6 text-gray-600" />
      <h2 className="text-2xl font-medium text-gray-400 mb-3">
        AI Chat Assistant (Gemini)
      </h2>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        Bắt đầu cuộc hội thoại bằng cách nhập tin nhắn của bạn bên dưới.
      </p>
      {/* Gợi ý */}
      <div className="flex flex-col md:flex-row gap-2 max-w-md w-full">
        <div
          onClick={() => onPromptClick(prompt1)}
          className="p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-left text-sm cursor-pointer hover:bg-gray-700/70 transition-colors"
        >
          <p className="font-semibold text-gray-300">Giải thích chủ đề</p>
          <p className="text-gray-400 text-xs">"{prompt1}"</p>
        </div>
        <div
          onClick={() => onPromptClick(prompt2)}
          className="p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-left text-sm cursor-pointer hover:bg-gray-700/70 transition-colors"
        >
          <p className="font-semibold text-gray-300">Viết code</p>
          <p className="text-gray-400 text-xs">"{prompt2}"</p>
        </div>
      </div>
    </div>
  );
};
