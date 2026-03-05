import { ChatMessage } from '@/types/chat'
import { MAX_STORED_MESSAGES } from '@/lib/config'

// Global in-memory store scoped to the Node.js process.
// Works within a single server instance (local dev, single Vercel function).
// For multi-instance production deployments, replace with a persistent store
// such as Vercel KV or Upstash Redis.
declare global {
  // eslint-disable-next-line no-var
  var __chatMessages: ChatMessage[] | undefined
}

function getStore(): ChatMessage[] {
  if (!global.__chatMessages) global.__chatMessages = []
  return global.__chatMessages
}

export function addMessage(text: string, sender: ChatMessage['sender']): ChatMessage {
  const store = getStore()

  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    sender,
    timestamp: Date.now(),
  }

  store.push(message)

  if (store.length > MAX_STORED_MESSAGES) {
    store.splice(0, store.length - MAX_STORED_MESSAGES)
  }

  return message
}

export function getMessages(since?: number): ChatMessage[] {
  const store = getStore()
  return since !== undefined ? store.filter(m => m.timestamp > since) : [...store]
}
