// "use client";
// import { Bot, User, BrainCircuit, Loader2 } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import { Card, CardContent } from "@/components/ui/card";
// import { cn } from "@/lib/utils";
// // Message interface được giữ nguyên
// export interface Message {
//   id: string;
//   role: "user" | "assistant";
//   content: string; // Nội dung chính (content)
//   reasoning: string; // Nội dung suy luận (reasoning_content)
//   timestamp: Date;
// }

// export function ChatMessage({
//   message,
//   isLoading,
// }: {
//   message: Message;
//   isLoading?: boolean;
// }) {
//   const isUser = message.role === "user";

//   const renderReasoning = () => {
//     if (!message.reasoning) return null;

//     return (
//       <div className="w-full mt-3 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
//         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-yellow-500/20">
//           <BrainCircuit className="w-4 h-4 text-yellow-500/70" />
//           <span className="text-xs font-medium text-yellow-500/70">
//             Internal Thought Process
//           </span>
//         </div>
//         <div className="text-sm text-yellow-100/70 font-normal space-y-2 leading-relaxed">
//           {message.reasoning}
//         </div>
//       </div>
//     );
//   };
//   const Icon = isUser ? User : Bot;
//   return (
//     <div
//       className={cn(
//         "group relative flex w-full gap-4 px-4 sm:max-w-[85%]",
//         isUser ? "flex-row-reverse ml-auto" : "flex-row"
//       )}
//     >
//       {/* Avatar */}
//       <div
//         className={cn(
//           "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
//           isUser
//             ? "bg-blue-600/15 ring-2 ring-blue-600/30"
//             : "bg-indigo-600/15 ring-2 ring-indigo-600/30"
//         )}
//       >
//         {isUser ? (
//           <User className="h-5 w-5 text-blue-400" />
//         ) : (
//           <Bot className="h-5 w-5 text-indigo-400" />
//         )}
//       </div>

//       {/* Message Content */}
//       <div className={isUser ? "" : "flex-1 space-y-2"}>
//         {/* <div className={cn(
//           "text-sm font-medium",
//           isUser ? "text-blue-400" : "text-indigo-400"
//         )}>
//           {isUser ? "You" : "AI Assistant"}
//         </div> */}

//         <div
//           className={cn(
//             "relative rounded-xl px-4 py-3",
//             "text-sm leading-relaxed",
//             "ring-1",
//             isUser
//               ? "bg-blue-600/10 ring-blue-600/25 text-blue-50 w-fit"
//               : "bg-gray-900/50 ring-gray-800 text-gray-100"
//           )}
//         >
//           {isLoading && (
//             <Loader2 className="w-3 h-3 animate-spin text-blue-400 absolute top-2 right-2" />
//           )}
//           {/* {isLoading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-gray-950/20 rounded-xl backdrop-blur-sm">
//               <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
//             </div>
//           )} */}

//           {!isUser && message.reasoning && (
//             <div className="mb-3 pb-3 border-b border-gray-800/50">
//               <div className="flex items-center gap-2 mb-2">
//                 <BrainCircuit className="w-4 h-4 text-yellow-500/70" />
//                 <span className="text-xs font-medium text-yellow-500/70">
//                   Thinking Process
//                 </span>
//               </div>
//               <div className="text-sm text-gray-400/90">
//                 {message.reasoning}
//               </div>
//             </div>
//           )}

//           <div className="prose prose-invert prose-sm max-w-none">
//             <ReactMarkdown>{message.content}</ReactMarkdown>
//           </div>
//         </div>

//         <time className={`text-xs text-gray-500`}>
//           {message.timestamp.toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//             hour12: true,
//           })}
//         </time>
//       </div>
//     </div>
//   );
// }

"use client";
import { Bot, User, BrainCircuit, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

// Đảm bảo import Message type nếu nó không nằm trong file này
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning: string;
  timestamp: Date;
}

// Hàm định dạng thời gian
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ChatMessage({
  message,
  isLoading,
}: {
  message: Message;
  isLoading?: boolean;
}) {
  const isUser = message.role === "user";

  // Logic rendering cho Internal Thought
  const renderReasoningBox = () => {
    if (!message.reasoning) return null;

    // Tối ưu UI cho Reasoning Box
    return (
      <div className="w-full mt-3 p-3 rounded-lg border border-yellow-700/50 bg-gray-900/60 shadow-md">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
          <BrainCircuit className="w-4 h-4 text-yellow-500/80" />
          <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
            Internal Thought Process
          </span>
        </div>
        {/* Sử dụng pre-wrap với text-sm để trông như một đoạn log/code */}
        <pre className="whitespace-pre-wrap font-mono text-[11px] leading-snug text-gray-300/90">
          {message.reasoning}
        </pre>
      </div>
    );
  };

  // Icon giữ nguyên
  const Icon = isUser ? User : Bot;

  return (
    <div
      className={cn(
        // Giảm max-w từ 85% xuống 75% để gọn gàng hơn
        "group relative flex w-full gap-3 px-0 sm:max-w-[75%]",
        isUser ? "flex-row-reverse ml-auto" : "flex-row"
      )}
    >
      {/* 1. Avatar (Căn trên cùng) */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full self-start", // self-start: Căn trên
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

      {/* 2. Message Wrapper (Nội dung + Timestamp) */}
      <div
        className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
      >
        {/* Bong bóng tin nhắn */}
        <div
          className={cn(
            "relative rounded-xl px-4 py-3 text-sm leading-relaxed ring-1 shadow-lg",
            // Thêm max-w-lg để kiểm soát chiều rộng nội dung trên màn hình lớn
            "",
            isUser
              ? "bg-blue-600 text-blue-50 w-fit ring-blue-600/50 rounded-br-sm" // Bong bóng User
              : "bg-gray-800/80 ring-gray-700 text-gray-100 rounded-tl-sm" // Bong bóng Assistant
          )}
        >
          {/* 2.1. Internal Thought (chỉ cho Assistant) */}
          {!isUser && renderReasoningBox()}

          {/* 2.2. Nội dung chính */}
          <div className="prose prose-invert prose-sm max-w-none">
            {/* Nếu đang streaming và chưa có nội dung, hiển thị chấm loading */}
            {isLoading && !message.content && !message.reasoning ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
            )}
          </div>
        </div>

        {/* 2.3. Timestamp (Căn lề) */}
        <time
          className={cn(
            `text-[10px] text-gray-500 mt-1`,
            isUser ? "mr-1" : "ml-1" // Căn lề thời gian
          )}
        >
          {isLoading
            ? isUser
              ? "Sent"
              : "Streaming..."
            : formatTime(message.timestamp)}
        </time>
      </div>
    </div>
  );
}
