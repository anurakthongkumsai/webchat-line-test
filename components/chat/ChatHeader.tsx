interface Props {
  connected: boolean
  unreadCount: number
  notifPermission: NotificationPermission
  pollIntervalSec: number
  onRequestNotif: () => void
}

export default function ChatHeader({
  connected,
  unreadCount,
  notifPermission,
  pollIntervalSec,
  onRequestNotif,
}: Props) {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white text-sm ring-2 ring-white/30">
            OA
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-emerald-600 transition-colors ${
              connected ? 'bg-green-300' : 'bg-gray-400'
            }`}
          />
        </div>

        <div>
          <p className="text-white font-semibold text-sm leading-tight">LINE Official Account</p>
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
      </div>

      <div className="flex items-center gap-2">
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
