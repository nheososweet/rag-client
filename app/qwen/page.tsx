"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
// Import các component từ thư mục components
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/ui/chat-layout";
// Import các icons và UUID
import { Send, Loader2, MessageCircle, Bot } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Message, ChatMessage } from "@/components/ChatMessage";

interface ChatChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      content?: string;
      reasoning_content?: string;
    };
    logprobs: null;
    finish_reason: string | null;
    token_ids: null;
  }[];
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Ref cũ cho viewport (Không cần thiết cho logic cuộn, nhưng có thể giữ lại)
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // ⭐ REF MỚI: Phần tử neo ở cuối danh sách
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hàm cuộn xuống cuối: Cuộn đến phần tử neo
  const scrollToBottom = () => {
    // Sử dụng scrollIntoView trên phần tử neo
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end", // Đảm bảo phần tử neo nằm ở cuối viewport
    });
  };

  // Cuộn xuống cuối sau mỗi lần render khi messages thay đổi
  useEffect(() => {
    // Tăng cường độ tin cậy bằng cách gọi cuộn
    scrollToBottom();
  }, [messages]);

  // Logic streaming giữ nguyên
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    inputRef.current?.focus();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input,
      reasoning: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = uuidv4();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      reasoning: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch(
        // "http://127.0.0.1:8080/v1/chat/completions",
        "http://127.0.0.1:8080/v1/chat/rag",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            model: "Qwen/Qwen3-0.6B",
            messages: [{ role: "user", content: userMessage.content }],
            temperature: 0.7,
            max_tokens: 32768,
            stream: true,
          }),
        }
      );

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let accumulatedReasoning = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const jsonString = line.substring(6).trim();

          if (jsonString === "[DONE]" || !jsonString) continue;

          try {
            const parsedChunk: ChatChunk = JSON.parse(jsonString);
            const delta = parsedChunk.choices[0].delta;

            if (delta.content) {
              accumulatedContent += delta.content;
            }

            if (delta.reasoning_content) {
              accumulatedReasoning += delta.reasoning_content;
            }

            // Cập nhật state (việc này sẽ kích hoạt useEffect và cuộn)
            setMessages((prev) => {
              const newMessages = [...prev];
              const streamMsg = newMessages.find((m) => m.id === assistantId);

              if (streamMsg) {
                streamMsg.content = accumulatedContent;
                streamMsg.reasoning = accumulatedReasoning;
              }
              return newMessages;
            });
          } catch (e) {
            console.error("Lỗi parse JSON chunk:", e, "Chunk:", jsonString);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi/nhận API:", error);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      alert("Đã xảy ra lỗi khi kết nối đến API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatLayout>
      <div className="flex flex-col h-full w-full">
        {/* CHAT AREA */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full">
            <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 pb-32">
              {/* Empty State */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                  <Bot className="w-16 h-16 mb-6 text-gray-600" />
                  <h2 className="text-2xl font-medium text-gray-400 mb-3">
                    Welcome to AI Assistant
                  </h2>
                  <p className="text-sm text-gray-500 max-w-md">
                    Start a conversation! The AI will show its **Internal
                    Thought** before the main response.
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLoading={
                      isLoading &&
                      index === messages.length - 1 &&
                      message.role === "assistant"
                    }
                  />
                ))}
              </div>

              <div ref={messagesEndRef} className="h-4 w-full" />
            </div>
          </ScrollArea>
        </div>

        {/* INPUT FORM */}
        <div className="border-t border-gray-700/50 bg-gray-900/80 backdrop-blur">
          <div className="max-w-5xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-12 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 text-base"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors min-w-[100px]"
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
        </div>
      </div>
    </ChatLayout>
  );
}
