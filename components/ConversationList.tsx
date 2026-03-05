'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Conversation } from '@/types/chat'
import { POLL_INTERVAL_MS } from '@/lib/config'
import { formatTime } from '@/lib/utils'

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/conversations')
        if (!res.ok) return
        const { conversations } = await res.json()
        setConversations(conversations)
      } catch {
        // silently ignore poll errors
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
    const id = setInterval(fetchConversations, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="min-h-screen sm:min-h-0 bg-gradient-to-br from-slate-100 via-green-50 to-teal-50 flex items-center justify-center sm:p-4">
      <div className="w-full sm:max-w-xl bg-white sm:rounded-2xl sm:shadow-2xl overflow-hidden flex flex-col h-screen sm:h-[88vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-white font-semibold text-base leading-tight">LINE Official Account</h1>
            <p className="text-green-100 text-xs mt-0.5">
              {loading
                ? 'Loading...'
                : conversations.length > 0
                ? `${conversations.length} conversation${conversations.length > 1 ? 's' : ''}`
                : 'No conversations yet'}
            </p>
          </div>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {totalUnread} unread
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl">
                💬
              </div>
              <div>
                <p className="text-gray-600 font-medium text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Waiting for LINE users to send messages
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map(conv => (
                <button
                  key={conv.userId}
                  onClick={() => router.push(`/chat/${conv.userId}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.pictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={conv.pictureUrl}
                        alt={conv.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-lg">
                        {conv.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p
                        className={`text-sm truncate ${
                          conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        }`}
                      >
                        {conv.displayName}
                      </p>
                      <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(conv.lastTimestamp)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Chevron */}
                  <svg
                    className="w-4 h-4 text-gray-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
