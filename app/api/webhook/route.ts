import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getLineServerConfig, LINE_API_PROFILE_URL } from '@/lib/config'
import { addMessage, setUserProfile } from '@/lib/messageStore'

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('SHA256', secret).update(body).digest('base64')
  return expected === signature
}

async function fetchAndCacheProfile(userId: string, token: string): Promise<void> {
  try {
    const res = await fetch(`${LINE_API_PROFILE_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const { displayName, pictureUrl } = await res.json()
    await setUserProfile(userId, displayName, pictureUrl)
  } catch {
    // Profile fetch is non-critical — fall back to userId as display name
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature') ?? ''

    const { channelSecret, channelAccessToken } = getLineServerConfig()

    if (!verifySignature(body, signature, channelSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { events } = JSON.parse(body)

    for (const event of events) {
      const userId = event.source?.userId
      if (!userId) continue

      if (event.type === 'message' && event.message?.type === 'text') {
        await fetchAndCacheProfile(userId, channelAccessToken)
        await addMessage(userId, event.message.text, 'line')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[webhook]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
