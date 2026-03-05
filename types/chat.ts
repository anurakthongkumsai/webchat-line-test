export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'line'
  timestamp: number
}

export interface Conversation {
  userId: string
  displayName: string
  pictureUrl?: string
  lastMessage: string
  lastTimestamp: number
  unreadCount: number
}
