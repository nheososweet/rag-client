# AI Chat Assistant

Modern chat interface built with Next.js 13+, Tailwind CSS and Streaming AI responses.

## Features

- 🎨 Modern UI with dark theme
- 🔄 Real-time streaming responses
- 💭 Internal thought process display
- 📱 Responsive design
- 🎯 Auto-scroll functionality
- 🔒 Type-safe development with TypeScript

## Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Markdown:** React Markdown
- **State Management:** React Hooks
- **API Integration:** Fetch API with Streaming
- **Type Safety:** TypeScript

## Project Structure

```
chatbot-app/
├── app/
│   └── page.tsx           # Main chat interface
├── components/
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── scroll-area.tsx
│   └── ChatMessage.tsx   # Chat message component
├── lib/
│   └── utils.ts         # Utility functions
└── public/
    └── assets/         # Static assets
```

## API Integration

### Endpoint

- Base URL: `http://127.0.0.1:8080`
- Endpoints:
  - `/v1/chat/rag` - RAG-enhanced chat completion
  - `/v1/chat/completions` - Standard chat completion

### Request Format

```json
{
  "model": "Qwen/Qwen3-0.6B",
  "messages": [
    {
      "role": "user",
      "content": "string"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 32768,
  "stream": true
}
```

### Response Format

Streaming response with chunks:

```json
{
  "id": "string",
  "object": "string",
  "created": number,
  "model": "string",
  "choices": [
    {
      "index": number,
      "delta": {
        "content": "string",
        "reasoning_content": "string"
      }
    }
  ]
}
```

## Required Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-scroll-area": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "next": "13.x",
    "react": "18.x",
    "react-dom": "18.x",
    "react-markdown": "latest",
    "tailwind-merge": "latest",
    "tailwindcss-animate": "latest",
    "uuid": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/uuid": "latest",
    "autoprefixer": "latest",
    "postcss": "latest",
    "tailwindcss": "latest",
    "typescript": "latest"
  }
}
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd chatbot-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Package Version Control

To freeze package versions, create a `package.json` with exact versions:

```bash
npm list --depth=0 > versions.txt
```

Then update your package.json with the exact versions from versions.txt.

## Development

1. **Component Structure:**

   - `page.tsx`: Main chat interface and API logic
   - `ChatMessage.tsx`: Individual message rendering
   - `ui/*`: Reusable UI components

2. **API Integration:**

   - Streaming response handling
   - Error handling
   - Loading states

3. **Styling:**
   - Tailwind CSS for styling
   - Dark theme
   - Responsive design
   - Custom animations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
