import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getLineServerConfig } from '@/lib/config'
import { addMessage } from '@/lib/messageStore'

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('SHA256', secret).update(body).digest('base64')
  return expected === signature
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature') ?? ''

    const { channelSecret } = getLineServerConfig()

    if (!verifySignature(body, signature, channelSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { events } = JSON.parse(body)

    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        addMessage(event.message.text, 'line')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[webhook]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
