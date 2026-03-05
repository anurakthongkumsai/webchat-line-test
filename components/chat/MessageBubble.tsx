import { ChatMessage } from '@/types/chat'
import { formatTime } from '@/lib/utils'

interface Props {
  message: ChatMessage
  groupedWithPrev: boolean
  groupedWithNext: boolean
  senderName: string
  senderPicture?: string
}

export default function MessageBubble({
  message,
  groupedWithPrev,
  groupedWithNext,
  senderName,
  senderPicture,
}: Props) {
  const isUser = message.sender === 'user'

  return (
    <div
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} ${
        groupedWithPrev ? 'mt-0.5' : 'mt-3'
      }`}
    >
      {/* LINE user avatar */}
      {!isUser && (
        <div className={`flex-shrink-0 ${groupedWithPrev ? 'invisible' : ''}`}>
          {senderPicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={senderPicture}
              alt={senderName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col gap-0.5 max-w-[68%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
            isUser
              ? 'bg-green-500 text-white rounded-2xl rounded-br-sm shadow-sm'
              : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100'
          }`}
        >
          {message.text}
        </div>
        {!groupedWithNext && (
          <span className="text-[11px] text-gray-400 px-1">{formatTime(message.timestamp)}</span>
        )}
      </div>

      {/* Webchat user avatar */}
      {isUser && (
        <div
          className={`w-7 h-7 rounded-full bg-blue-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
            groupedWithPrev ? 'invisible' : ''
          }`}
        >
          You
        </div>
      )}
    </div>
  )
}
