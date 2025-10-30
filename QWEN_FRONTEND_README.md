# Qwen Chat Integration - Frontend

Một ứng dụng Next.js tích hợp với Qwen API để cung cấp trải nghiệm chat AI tiên tiến với tính năng thinking mode và RAG (Retrieval-Augmented Generation).

## ✨ Tính năng chính

### 🧠 Qwen Chat Advanced

- **Thinking Mode**: Xem quá trình suy luận của AI từng bước
- **RAG Support**: Chat với khả năng tìm kiếm và trích xuất tài liệu
- **Real-time Streaming**: Nhận phản hồi theo thời gian thực
- **Mode Switching**: Chuyển đổi giữa Basic Chat và RAG Chat
- **Advanced Settings**: Điều chỉnh temperature, max_tokens, top_k, similarity_threshold

### 🎛️ Cấu hình linh hoạt

- **Temperature Control**: Điều chỉnh độ sáng tạo của AI (0.1 - 2.0)
- **Token Management**: Kiểm soát độ dài phản hồi (100 - 32768 tokens)
- **RAG Parameters**: Cấu hình số lượng tài liệu và ngưỡng tương đồng
- **System Messages**: Tùy chỉnh hướng dẫn hệ thống cho AI

### 📚 RAG Features

- **Document Retrieval**: Tìm kiếm tài liệu liên quan tự động
- **Similarity Scoring**: Hiển thị điểm tương đồng của các tài liệu
- **Source Citations**: Trích dẫn nguồn tài liệu trong phản hồi
- **Retrieval Statistics**: Thông tin chi tiết về quá trình tìm kiếm

## 🏗️ Cấu trúc dự án

```
rag-client/
├── app/
│   ├── qwen-chat/           # Main Qwen chat page
│   ├── rag/                 # RAG chat page
│   ├── gemini/              # Gemini chat page
│   └── qwen/                # Legacy Qwen page
├── components/
│   ├── qwen/                # Qwen-specific components
│   │   ├── QwenModeSelector.tsx
│   │   ├── QwenSettings.tsx
│   │   ├── QwenChatMessage.tsx
│   │   └── QwenRAGInfo.tsx
│   ├── ui/                  # Shadcn/ui components
│   └── Navigation.tsx       # App navigation
├── lib/
│   ├── api/
│   │   └── qwen.ts          # Qwen API utilities
│   └── utils.ts
└── types/
    └── qwen.ts              # TypeScript definitions
```

## 🛠️ Công nghệ sử dụng

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Hook Form** - Form management
- **React Markdown** - Markdown rendering
- **Lucide React** - Icons

## 🚀 API Endpoints

### Basic Chat

- `POST /api/qwen/query` - Non-streaming chat
- `POST /api/qwen/stream` - Streaming chat

### RAG Chat

- `POST /api/qwen/rag` - Non-streaming RAG
- `POST /api/qwen/rag/stream` - Streaming RAG

### Health Check

- `GET /api/qwen/health` - Server status

## 📦 Components

### QwenModeSelector

Cho phép chuyển đổi giữa Basic Chat và RAG Chat mode với mô tả chi tiết về từng chế độ.

### QwenSettings

Panel cấu hình với các tùy chọn:

- Thinking mode (enabled/disabled/auto)
- Temperature slider
- Max tokens input
- RAG-specific: top_k documents, similarity threshold
- Basic-specific: system message, top_p, top_k

### QwenChatMessage

Component message đặc biệt hiển thị:

- Thinking content với styling riêng
- RAG information (retrieved documents)
- Generation time và token usage
- Mode indicators

### QwenRAGInfo

Component hiển thị thông tin RAG:

- Retrieved documents với similarity scores
- Retrieval statistics
- Document metadata
- Expandable/collapsible interface

## 🎨 UI/UX Features

- **Dark theme** với color scheme chuyên nghiệp
- **Responsive design** cho mọi kích thước màn hình
- **Real-time streaming** với smooth updates
- **Loading states** và error handling
- **Health status indicator** cho server connection
- **Gradient backgrounds** và modern styling
- **Accessibility** với proper ARIA labels

## 🔧 Cấu hình

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### API Configuration

File `lib/api/qwen.ts` chứa tất cả logic giao tiếp với backend:

- Error handling với custom QwenAPIError
- Streaming support với AsyncGenerator
- TypeScript type safety
- Automatic retry và fallback

## 🎯 Use Cases

1. **Research Assistant**: Sử dụng RAG mode để chat với knowledge base
2. **Creative Writing**: Basic mode với thinking process để viết sáng tạo
3. **Document Analysis**: RAG mode để phân tích và trích xuất thông tin
4. **Learning Tool**: Thinking mode để hiểu cách AI giải quyết vấn đề

## 🔄 State Management

- **React useState** cho local component state
- **useRef** cho DOM manipulation và streaming
- **useEffect** cho side effects và cleanup
- **Form state** với controlled inputs

## 📱 Responsive Design

- **Mobile-first** approach
- **Flexible layouts** với CSS Grid và Flexbox
- **Adaptive typography** và spacing
- **Touch-friendly** interactions

## 🚀 Performance

- **Streaming responses** để giảm perceived latency
- **Component optimization** với proper re-rendering
- **Efficient state updates** cho real-time chat
- **Lazy loading** cho heavy components

## 🔒 Error Handling

- **API error boundaries** với user-friendly messages
- **Network failure** handling và retry logic
- **Validation** cho user inputs
- **Loading states** và error recovery

Ứng dụng này cung cấp một interface hoàn chỉnh và chuyên nghiệp để tương tác với Qwen AI model, với khả năng mở rộng và tùy chỉnh cao.
