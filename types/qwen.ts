/**
 * Types và interfaces cho Qwen API integration
 */

// Thinking mode enum
export enum ThinkingMode {
  ENABLED = "enabled",
  DISABLED = "disabled", 
  AUTO = "auto"
}

// Chat modes
export enum QwenChatMode {
  BASIC = "basic",
  RAG = "rag"
}

// Base request parameters
export interface QwenBaseParams {
  thinking_mode: ThinkingMode;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
}

// Basic query request
export interface QwenQueryRequest extends QwenBaseParams {
  question: string;
  context?: string;
  system_message?: string;
}

// RAG query request  
export interface QwenRAGQueryRequest extends Omit<QwenBaseParams, 'top_k'> {
  question: string;
  top_k: number; // Number of documents to retrieve
  similarity_threshold: number;
}

// Token usage info
export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

// Basic response
export interface QwenResponse {
  content: string;
  thinking_content: string;
  thinking_mode: ThinkingMode;
  model: string;
  usage: TokenUsage;
  finish_reason?: string;
  generation_time: number;
}

// Retrieved document chunk
export interface RetrievedChunk {
  content: string;
  similarity: number;
  document_id?: string;
  chunk_index?: number;
  metadata?: Record<string, any>;
}

// Retrieval statistics
export interface RetrievalStats {
  retrieved_chunks: number;
  retrieval_time: number;
  generation_time?: number;
  total_time?: number;
  similarity_threshold: number;
}

// RAG response
export interface QwenRAGResponse extends QwenResponse {
  retrieved_chunks: RetrievedChunk[];
  retrieval_stats: RetrievalStats;
}

// Streaming chunk types
export type StreamChunkType = 'thinking' | 'content' | 'finish' | 'error' | 'retrieval';

// Basic streaming chunk
export interface QwenStreamChunk {
  type: StreamChunkType;
  content: string;
  thinking_content: string;
  thinking_mode: ThinkingMode;
  finish_reason?: string;
}

// RAG streaming chunk
export interface QwenRAGStreamChunk extends QwenStreamChunk {
  retrieved_chunks?: RetrievedChunk[];
  retrieval_stats?: RetrievalStats;
}

// Health check response
export interface QwenHealthCheck {
  status: 'healthy' | 'unhealthy' | 'error';
  model: string;
  server_url: string;
  available: boolean;
}

// Chat message interface
export interface QwenMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking_content?: string;
  timestamp: Date;
  mode: QwenChatMode;
  
  // RAG specific fields
  retrieved_chunks?: RetrievedChunk[];
  retrieval_stats?: RetrievalStats;
  
  // Response metadata
  generation_time?: number;
  token_usage?: TokenUsage;
  finish_reason?: string;
}

// Settings for different modes
export interface QwenBasicSettings extends QwenBaseParams {
  system_message?: string;
}

export interface QwenRAGSettings extends Omit<QwenBaseParams, 'top_k'> {
  top_k: number;
  similarity_threshold: number;
}

// Combined settings type
export interface QwenSettings {
  mode: QwenChatMode;
  basic: QwenBasicSettings;
  rag: QwenRAGSettings;
}

// API error response
export interface QwenError {
  detail: string;
  status_code?: number;
}