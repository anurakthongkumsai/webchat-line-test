'use client'

import { useRouter } from 'next/navigation'

interface Props {
  connected: boolean
  unreadCount: number
  notifPermission: NotificationPermission
  pollIntervalSec: number
  displayName: string
  pictureUrl?: string
  onRequestNotif: () => void
}

export default function ChatHeader({
  connected,
  unreadCount,
  notifPermission,
  pollIntervalSec,
  displayName,
  pictureUrl,
  onRequestNotif,
}: Props) {
  const router = useRouter()

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="text-white/80 hover:text-white transition-colors flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {pictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pictureUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30" />
        ) : (
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-white text-sm ring-2 ring-white/30">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-emerald-600 transition-colors ${
            connected ? 'bg-green-300' : 'bg-gray-400'
          }`}
        />
      </div>

      {/* Name & status */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight truncate">{displayName}</p>
        <p className="text-green-100 text-xs flex items-center gap-1 mt-0.5">
          {connected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse inline-block" />
              Live · syncs every {pollIntervalSec}s
            </>
          ) : (
            'Connecting...'
          )}
        </p>
      </div>

      {/* Notification + unread */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
            {unreadCount} new
          </span>
        )}
        {notifPermission === 'default' && (
          <button
            onClick={onRequestNotif}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors"
          >
            🔔 Notify
          </button>
        )}
        {notifPermission === 'granted' && (
          <span className="text-green-100 text-xs">🔔 On</span>
        )}
      </div>
    </div>
  )
}
