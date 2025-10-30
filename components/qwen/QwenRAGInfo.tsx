"use client";

import { RetrievedChunk, RetrievalStats } from "@/types/qwen";
import { cn } from "@/lib/utils";
import {
  Database,
  FileText,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Search,
  Hash,
} from "lucide-react";
import { useState } from "react";

interface QwenRAGInfoProps {
  retrievedChunks?: RetrievedChunk[];
  retrievalStats?: RetrievalStats;
  className?: string;
}

export function QwenRAGInfo({
  retrievedChunks,
  retrievalStats,
  className,
}: QwenRAGInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!retrievedChunks && !retrievalStats) {
    return null;
  }

  const hasChunks = retrievedChunks && retrievedChunks.length > 0;
  const hasStats = retrievalStats;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with stats summary */}
      <div
        className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-green-500/20">
            <Database className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-green-300">
              RAG Information
            </div>
            {hasStats && (
              <div className="text-xs text-green-400/70">
                {retrievalStats.retrieved_chunks} documents •{" "}
                {retrievalStats.retrieval_time.toFixed(2)}s
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasStats && (
            <div className="text-xs text-green-400/70">
              Threshold: {retrievalStats.similarity_threshold}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-green-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-green-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-4 p-4 rounded-lg border border-green-500/10 bg-green-500/5">
          {/* Stats Grid */}
          {hasStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-md border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">Documents</span>
                </div>
                <div className="text-sm font-medium text-white mt-1">
                  {retrievalStats.retrieved_chunks}
                </div>
              </div>

              <div className="p-3 rounded-md border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">Threshold</span>
                </div>
                <div className="text-sm font-medium text-white mt-1">
                  {retrievalStats.similarity_threshold}
                </div>
              </div>

              <div className="p-3 rounded-md border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">Retrieval</span>
                </div>
                <div className="text-sm font-medium text-white mt-1">
                  {retrievalStats.retrieval_time.toFixed(2)}s
                </div>
              </div>

              {retrievalStats.total_time && (
                <div className="p-3 rounded-md border border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-300">Total</span>
                  </div>
                  <div className="text-sm font-medium text-white mt-1">
                    {retrievalStats.total_time.toFixed(2)}s
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Retrieved Documents */}
          {hasChunks && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-300">
                <FileText className="w-4 h-4" />
                <span>Retrieved Documents ({retrievedChunks.length})</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {retrievedChunks.map((chunk, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md border border-gray-600 bg-gray-800/30 space-y-2"
                  >
                    {/* Chunk header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-300">
                          Document {index + 1}
                        </span>
                        {chunk.document_id && (
                          <span className="text-xs text-gray-500">
                            ID: {chunk.document_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          Similarity:
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded",
                            chunk.similarity >= 0.8
                              ? "bg-green-500/20 text-green-300"
                              : chunk.similarity >= 0.6
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-gray-500/20 text-gray-300"
                          )}
                        >
                          {(chunk.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Chunk content */}
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {chunk.content.length > 200
                        ? `${chunk.content.slice(0, 200)}...`
                        : chunk.content}
                    </div>

                    {/* Metadata */}
                    {chunk.metadata &&
                      Object.keys(chunk.metadata).length > 0 && (
                        <div className="pt-2 border-t border-gray-700">
                          <div className="text-xs text-gray-500">
                            Metadata: {JSON.stringify(chunk.metadata, null, 0)}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No documents message */}
          {!hasChunks && hasStats && retrievalStats.retrieved_chunks === 0 && (
            <div className="p-4 rounded-md border border-yellow-500/20 bg-yellow-500/5 text-center">
              <Search className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-sm text-yellow-300">
                No relevant documents found
              </div>
              <div className="text-xs text-yellow-400/70 mt-1">
                Try lowering the similarity threshold or asking a different
                question
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
