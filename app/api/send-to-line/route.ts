import { NextResponse } from 'next/server'
import { getLineServerConfig, LINE_API_PUSH_URL } from '@/lib/config'
import { addMessage } from '@/lib/messageStore'

export async function POST(request: Request) {
  try {
    const { userId, message } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const { channelAccessToken } = getLineServerConfig()

    const response = await fetch(LINE_API_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'text', text: message.trim() }],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[LINE API]', error)
      return NextResponse.json({ error: 'Failed to send message to LINE' }, { status: 502 })
    }

    addMessage(userId, message.trim(), 'user')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[send-to-line]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
