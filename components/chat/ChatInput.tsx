import { RefObject } from 'react'

interface Props {
  value: string
  maxChars: number
  loading: boolean
  textareaRef: RefObject<HTMLTextAreaElement>
  onChange: (val: string) => void
  onSend: () => void
}

export default function ChatInput({ value, maxChars, loading, textareaRef, onChange, onSend }: Props) {
  const canSend = !loading && value.trim().length > 0
  const charsLeft = maxChars - value.length
  const nearLimit = value.length > maxChars * 0.85

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value.slice(0, maxChars))
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="border-t border-gray-100 bg-white px-4 pt-3 pb-4 flex-shrink-0">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={loading}
            rows={1}
            className="w-full px-4 py-3 pr-14 bg-gray-100 focus:bg-white rounded-2xl focus:ring-2 focus:ring-green-400 focus:outline-none resize-none text-sm transition-all leading-relaxed"
            style={{ minHeight: '46px', maxHeight: '120px' }}
          />
          {value.length > 0 && (
            <span
              className={`absolute right-3 bottom-3 text-[11px] tabular-nums ${
                nearLimit ? 'text-orange-400' : 'text-gray-300'
              }`}
            >
              {charsLeft}
            </span>
          )}
        </div>

        <button
          onClick={onSend}
          disabled={!canSend}
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            canSend
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg hover:scale-105'
              : 'bg-gray-100 text-gray-300'
          }`}
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-300 mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
