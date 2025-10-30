/**
 * API utilities cho Qwen endpoints
 */

import {
  QwenQueryRequest,
  QwenRAGQueryRequest,
  QwenResponse,
  QwenRAGResponse,
  QwenStreamChunk,
  QwenRAGStreamChunk,
  QwenHealthCheck,
  QwenError,
  QwenChatMode
} from '@/types/qwen';

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

// Error handler
class QwenAPIError extends Error {
  status_code?: number;
  
  constructor(message: string, status_code?: number) {
    super(message);
    this.name = 'QwenAPIError';
    this.status_code = status_code;
  }
}

// Helper function để handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData: QwenError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Ignore JSON parse errors, use default message
    }
    throw new QwenAPIError(errorMessage, response.status);
  }
  
  return response.json();
}

/**
 * Basic Qwen query (non-streaming)
 */
export async function qwenQuery(request: QwenQueryRequest): Promise<QwenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/qwen/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  return handleResponse<QwenResponse>(response);
}

/**
 * Basic Qwen streaming query
 */
export async function* qwenStream(request: QwenQueryRequest): AsyncGenerator<QwenStreamChunk, void, unknown> {
  const response = await fetch(`${API_BASE_URL}/api/v1/qwen/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorMessage = `HTTP error! status: ${response.status}`;
    throw new QwenAPIError(errorMessage, response.status);
  }
  
  if (!response.body) {
    throw new QwenAPIError('No response body received');
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
      
      for (const line of lines) {
        const data = line.substring(6).trim();
        
        if (data === '[DONE]' || !data) continue;
        
        try {
          const parsedChunk: QwenStreamChunk = JSON.parse(data);
          yield parsedChunk;
        } catch (error) {
          console.error('Error parsing SSE chunk:', error, 'Data:', data);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * RAG query (non-streaming)
 */
export async function qwenRAGQuery(request: QwenRAGQueryRequest): Promise<QwenRAGResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/qwen/rag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  return handleResponse<QwenRAGResponse>(response);
}

/**
 * RAG streaming query
 */
export async function* qwenRAGStream(request: QwenRAGQueryRequest): AsyncGenerator<QwenRAGStreamChunk, void, unknown> {
  const response = await fetch(`${API_BASE_URL}/api/v1/qwen/rag/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorMessage = `HTTP error! status: ${response.status}`;
    throw new QwenAPIError(errorMessage, response.status);
  }
  
  if (!response.body) {
    throw new QwenAPIError('No response body received');
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
      
      for (const line of lines) {
        const data = line.substring(6).trim();
        
        if (data === '[DONE]' || !data) continue;
        
        try {
          const parsedChunk: QwenRAGStreamChunk = JSON.parse(data);
          yield parsedChunk;
        } catch (error) {
          console.error('Error parsing RAG SSE chunk:', error, 'Data:', data);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Health check
 */
export async function qwenHealthCheck(): Promise<QwenHealthCheck> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/qwen/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<QwenHealthCheck>(response);
  } catch (error) {
    // Return default unhealthy status if request fails
    return {
      status: 'error',
      model: 'unknown',
      server_url: API_BASE_URL,
      available: false
    };
  }
}

/**
 * Generic streaming function cho cả basic và RAG
 */
export async function* qwenStreamGeneric(
  mode: QwenChatMode,
  request: QwenQueryRequest | QwenRAGQueryRequest
): AsyncGenerator<QwenStreamChunk | QwenRAGStreamChunk, void, unknown> {
  if (mode === QwenChatMode.BASIC) {
    yield* qwenStream(request as QwenQueryRequest);
  } else {
    yield* qwenRAGStream(request as QwenRAGQueryRequest);
  }
}

// Export error class
export { QwenAPIError };