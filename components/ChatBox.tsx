'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChatMessage } from '@/types/chat'
import { POLL_INTERVAL_MS, MAX_MESSAGE_CHARS } from '@/lib/config'
import { playNotifSound } from '@/lib/utils'
import ChatHeader from './chat/ChatHeader'
import MessageList from './chat/MessageList'
import ChatInput from './chat/ChatInput'

export default function ChatBox() {
  const [input, setInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')

  const lastTsRef = useRef(0)
  const initialLoadDoneRef = useRef(false)
  const isAtBottomRef = useRef(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if ('Notification' in window) setNotifPermission(Notification.permission)
  }, [])

  const sendBrowserNotif = useCallback(
    (text: string) => {
      if (notifPermission === 'granted' && document.hidden) {
        new Notification('LINE OA', { body: text, icon: '/favicon.ico' })
      }
    },
    [notifPermission]
  )

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) WebChat - LINE OA` : 'WebChat - LINE OA'
  }, [unreadCount])

  useEffect(() => {
    const clearUnread = () => {
      setUnreadCount(0)
      document.title = 'WebChat - LINE OA'
    }
    window.addEventListener('focus', clearUnread)
    return () => window.removeEventListener('focus', clearUnread)
  }, [])

  useEffect(() => {
    async function poll() {
      try {
        const url =
          lastTsRef.current > 0 ? `/api/messages?since=${lastTsRef.current}` : '/api/messages'
        const res = await fetch(url)
        if (!res.ok) { setConnected(false); return }
        setConnected(true)

        const { messages: incoming }: { messages: ChatMessage[] } = await res.json()
        const isInitialLoad = !initialLoadDoneRef.current

        if (incoming?.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const newMsgs = incoming.filter(m => !existingIds.has(m.id))
            if (newMsgs.length === 0) return prev

            if (!isInitialLoad) {
              const newFromLine = newMsgs.filter(m => m.sender === 'line')
              if (newFromLine.length > 0) {
                playNotifSound()
                newFromLine.forEach(m => sendBrowserNotif(m.text))
                if (!isAtBottomRef.current) setUnreadCount(c => c + newFromLine.length)
              }
            }

            return [...prev, ...newMsgs]
          })
          lastTsRef.current = Math.max(...incoming.map(m => m.timestamp))
        }

        if (isInitialLoad) {
          initialLoadDoneRef.current = true
          setInitialLoading(false)
        }
      } catch {
        setConnected(false)
        if (!initialLoadDoneRef.current) {
          initialLoadDoneRef.current = true
          setInitialLoading(false)
        }
      }
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [sendBrowserNotif])

  useEffect(() => {
    if (isAtBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAtBottom])

  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    isAtBottomRef.current = atBottom
    setIsAtBottom(atBottom)
    if (atBottom) {
      setUnreadCount(0)
      document.title = 'WebChat - LINE OA'
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setLoading(true)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const res = await fetch('/api/send-to-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        const data = await res.json()
        showError(data.error || 'Failed to send')
        return
      }

      await syncMessages()
      isAtBottomRef.current = true
      setIsAtBottom(true)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch {
      showError('Network error. Please try again.')
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleScrollToBottom = () => {
    isAtBottomRef.current = true
    setIsAtBottom(true)
    setUnreadCount(0)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const requestNotif = () =>
    Notification.requestPermission().then(p => setNotifPermission(p))

  const syncMessages = async () => {
    const res = await fetch('/api/messages')
    if (!res.ok) return
    const { messages: all }: { messages: ChatMessage[] } = await res.json()
    setMessages(all)
    if (all.length > 0) lastTsRef.current = Math.max(...all.map(m => m.timestamp))
  }

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(''), 4_000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ height: '88vh' }}
      >
        <ChatHeader
          connected={connected}
          unreadCount={unreadCount}
          notifPermission={notifPermission}
          pollIntervalSec={POLL_INTERVAL_MS / 1000}
          onRequestNotif={requestNotif}
        />

        <MessageList
          messages={messages}
          initialLoading={initialLoading}
          isAtBottom={isAtBottom}
          unreadCount={unreadCount}
          scrollContainerRef={scrollContainerRef}
          bottomRef={bottomRef}
          onScroll={handleScroll}
          onScrollToBottom={handleScrollToBottom}
        />

        {errorMsg && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-sm text-red-600 text-center flex-shrink-0">
            ⚠️ {errorMsg}
          </div>
        )}

        <ChatInput
          value={input}
          maxChars={MAX_MESSAGE_CHARS}
          loading={loading}
          textareaRef={textareaRef}
          onChange={setInput}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}
