import { kv } from '@vercel/kv'
import { ChatMessage, Conversation } from '@/types/chat'
import { MAX_STORED_MESSAGES } from '@/lib/config'

const MSGS_KEY = (userId: string) => `msgs:${userId}`
const PROFILE_KEY = (userId: string) => `profile:${userId}`
const UNREAD_KEY = (userId: string) => `unread:${userId}`
const USERIDS_KEY = 'userids'

export async function setUserProfile(userId: string, displayName: string, pictureUrl?: string): Promise<void> {
  await Promise.all([
    kv.set(PROFILE_KEY(userId), { displayName, pictureUrl }),
    kv.sadd(USERIDS_KEY, userId),
  ])
}

export async function getUserProfile(userId: string): Promise<{ displayName: string; pictureUrl?: string }> {
  const profile = await kv.get<{ displayName: string; pictureUrl?: string }>(PROFILE_KEY(userId))
  return profile ?? { displayName: userId.slice(0, 8) + '...' }
}

export async function addMessage(userId: string, text: string, sender: ChatMessage['sender']): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    sender,
    timestamp: Date.now(),
  }

  const existing = (await kv.get<ChatMessage[]>(MSGS_KEY(userId))) ?? []
  existing.push(message)
  if (existing.length > MAX_STORED_MESSAGES) {
    existing.splice(0, existing.length - MAX_STORED_MESSAGES)
  }

  await Promise.all([
    kv.set(MSGS_KEY(userId), existing),
    kv.sadd(USERIDS_KEY, userId),
    sender === 'line' ? kv.incr(UNREAD_KEY(userId)) : Promise.resolve(),
  ])

  return message
}

export async function getMessages(userId: string, since?: number): Promise<ChatMessage[]> {
  const messages = (await kv.get<ChatMessage[]>(MSGS_KEY(userId))) ?? []
  return since !== undefined ? messages.filter(m => m.timestamp > since) : messages
}

export async function markAsRead(userId: string): Promise<void> {
  await kv.set(UNREAD_KEY(userId), 0)
}

export async function listConversations(): Promise<Conversation[]> {
  const userIds = await kv.smembers(USERIDS_KEY)
  if (userIds.length === 0) return []

  const conversations = await Promise.all(
    userIds.map(async (userId) => {
      const [messages, profile, unread] = await Promise.all([
        kv.get<ChatMessage[]>(MSGS_KEY(userId)),
        kv.get<{ displayName: string; pictureUrl?: string }>(PROFILE_KEY(userId)),
        kv.get<number>(UNREAD_KEY(userId)),
      ])
      const lastMsg = messages?.[messages.length - 1]
      return {
        userId,
        displayName: profile?.displayName ?? userId.slice(0, 8) + '...',
        pictureUrl: profile?.pictureUrl,
        lastMessage: lastMsg?.text ?? '',
        lastTimestamp: lastMsg?.timestamp ?? 0,
        unreadCount: unread ?? 0,
      }
    })
  )

  return conversations
    .filter(c => c.lastTimestamp > 0)
    .sort((a, b) => b.lastTimestamp - a.lastTimestamp)
}
