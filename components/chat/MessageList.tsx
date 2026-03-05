import { RefObject } from 'react'
import { ChatMessage } from '@/types/chat'
import { groupByDate } from '@/lib/utils'
import { MESSAGE_GROUP_THRESHOLD_MS } from '@/lib/config'
import MessageBubble from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  initialLoading: boolean
  isAtBottom: boolean
  unreadCount: number
  scrollContainerRef: RefObject<HTMLDivElement>
  bottomRef: RefObject<HTMLDivElement>
  onScroll: () => void
  onScrollToBottom: () => void
}

export default function MessageList({
  messages,
  initialLoading,
  isAtBottom,
  unreadCount,
  scrollContainerRef,
  bottomRef,
  onScroll,
  onScrollToBottom,
}: Props) {
  const dateGroups = groupByDate(messages)

  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto px-4 py-3 bg-gray-50"
      >
        {initialLoading ? (
          <LoadingDots />
        ) : messages.length === 0 ? (
          <EmptyState />
        ) : (
          dateGroups.map(({ label, items }) => (
            <div key={label}>
              <DateSeparator label={label} />
              {items.map((msg, i) => {
                const prev = items[i - 1]
                const next = items[i + 1]
                const groupedWithPrev =
                  !!prev &&
                  prev.sender === msg.sender &&
                  msg.timestamp - prev.timestamp < MESSAGE_GROUP_THRESHOLD_MS
                const groupedWithNext =
                  !!next &&
                  next.sender === msg.sender &&
                  next.timestamp - msg.timestamp < MESSAGE_GROUP_THRESHOLD_MS

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    groupedWithPrev={groupedWithPrev}
                    groupedWithNext={groupedWithNext}
                  />
                )
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {!isAtBottom && !initialLoading && (
        <ScrollToBottomButton unreadCount={unreadCount} onClick={onScrollToBottom} />
      )}
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex justify-center items-center h-full">
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
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl">
        💬
      </div>
      <div>
        <p className="text-gray-600 font-medium text-sm">No messages yet</p>
        <p className="text-gray-400 text-xs mt-1">Send a message or wait for LINE OA to reply</p>
      </div>
    </div>
  )
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium px-2 bg-gray-50">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function ScrollToBottomButton({ unreadCount, onClick }: { unreadCount: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-3 right-3 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
    >
      {unreadCount > 0 ? (
        <span className="text-xs font-bold text-green-600">{unreadCount}</span>
      ) : (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  )
}
