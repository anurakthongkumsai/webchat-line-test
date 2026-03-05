import { ChatMessage, Conversation } from '@/types/chat'
import { MAX_STORED_MESSAGES } from '@/lib/config'

interface UserStore {
  messages: ChatMessage[]
  profile: { displayName: string; pictureUrl?: string }
  unreadCount: number
}

declare global {
  // eslint-disable-next-line no-var
  var __store: Map<string, UserStore> | undefined
}

function getStore(): Map<string, UserStore> {
  if (!global.__store) global.__store = new Map()
  return global.__store
}

function getUserStore(userId: string): UserStore {
  const store = getStore()
  if (!store.has(userId)) {
    store.set(userId, {
      messages: [],
      profile: { displayName: userId.slice(0, 8) + '...' },
      unreadCount: 0,
    })
  }
  return store.get(userId)!
}

export function setUserProfile(userId: string, displayName: string, pictureUrl?: string): void {
  getUserStore(userId).profile = { displayName, pictureUrl }
}

export function getUserProfile(userId: string) {
  return getUserStore(userId).profile
}

export function addMessage(userId: string, text: string, sender: ChatMessage['sender']): ChatMessage {
  const userStore = getUserStore(userId)

  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    sender,
    timestamp: Date.now(),
  }

  userStore.messages.push(message)

  if (userStore.messages.length > MAX_STORED_MESSAGES) {
    userStore.messages.splice(0, userStore.messages.length - MAX_STORED_MESSAGES)
  }

  if (sender === 'line') userStore.unreadCount++

  return message
}

export function getMessages(userId: string, since?: number): ChatMessage[] {
  const userStore = getUserStore(userId)
  return since !== undefined
    ? userStore.messages.filter(m => m.timestamp > since)
    : [...userStore.messages]
}

export function markAsRead(userId: string): void {
  getUserStore(userId).unreadCount = 0
}

export function listConversations(): Conversation[] {
  return Array.from(getStore().entries())
    .map(([userId, data]) => {
      const lastMsg = data.messages[data.messages.length - 1]
      return {
        userId,
        displayName: data.profile.displayName,
        pictureUrl: data.profile.pictureUrl,
        lastMessage: lastMsg?.text ?? '',
        lastTimestamp: lastMsg?.timestamp ?? 0,
        unreadCount: data.unreadCount,
      }
    })
    .filter(c => c.lastTimestamp > 0)
    .sort((a, b) => b.lastTimestamp - a.lastTimestamp)
}
