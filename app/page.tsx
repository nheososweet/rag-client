import Link from "next/link";
import {
  Brain,
  Database,
  MessageSquare,
  Bot,
  ArrowRight,
  CheckCircle,
  Zap,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: "Thinking Mode",
      description: "See how AI reasons through problems step by step",
    },
    {
      icon: Database,
      title: "RAG Integration",
      description: "Chat with document retrieval and context awareness",
    },
    {
      icon: Zap,
      title: "Real-time Streaming",
      description: "Get responses as they are generated",
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Analyze and cite source documents automatically",
    },
  ];

  const chatOptions = [
    {
      title: "Qwen Chat",
      description: "Advanced AI chat with thinking mode and RAG capabilities",
      href: "/qwen-chat",
      icon: Brain,
      featured: true,
      capabilities: [
        "Thinking Mode",
        "RAG Support",
        "Real-time Streaming",
        "Document Retrieval",
      ],
    },
    {
      title: "RAG Chat",
      description: "Chat with document retrieval and context",
      href: "/rag",
      icon: Database,
      capabilities: ["Document Search", "Context Aware", "Source Citations"],
    },
    {
      title: "Gemini Chat",
      description: "Google Gemini powered conversation",
      href: "/gemini",
      icon: MessageSquare,
      capabilities: ["Google AI", "Fast Responses", "Multi-modal"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                AI Chat Assistant
              </h1>
              <p className="text-xl lg:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                Experience the future of AI conversation with advanced thinking
                capabilities, document retrieval, and real-time streaming
                responses.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/qwen-chat">
                <Button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25 group">
                  <span>Try Qwen Chat</span>
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/rag">
                <Button
                  variant="outline"
                  className="border-gray-600 hover:border-indigo-500 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:bg-indigo-500/10 group"
                >
                  <span>RAG Chat</span>
                  <Database className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:rotate-12" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our AI chat platform combines cutting-edge technology with intuitive
            design
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="p-3 rounded-full bg-indigo-500/20 w-fit mx-auto">
                    <Icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Chat Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Choose Your Chat Experience
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Different AI models and capabilities for various use cases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {chatOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card
                key={index}
                className={`relative bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all ${
                  option.featured ? "ring-2 ring-indigo-500/30" : ""
                }`}
              >
                {option.featured && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                )}

                <CardContent className="p-6 space-y-6">
                  <div className="text-center space-y-3">
                    <div
                      className={`p-3 rounded-full w-fit mx-auto ${
                        option.featured ? "bg-indigo-500/20" : "bg-gray-700/50"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          option.featured ? "text-indigo-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {option.title}
                    </h3>
                    <p className="text-gray-400">{option.description}</p>
                  </div>

                  <div className="space-y-2">
                    {option.capabilities.map((capability, capIndex) => (
                      <div
                        key={capIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">{capability}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={option.href} className="block">
                    <Button
                      className={`w-full ${
                        option.featured
                          ? "bg-indigo-600 hover:bg-indigo-500"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      Start Chatting
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>Built with Next.js, Tailwind CSS, and Shadcn/ui</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
