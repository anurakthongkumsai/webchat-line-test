import { NextResponse } from 'next/server'
import { getMessages, markAsRead, getUserProfile } from '@/lib/messageStore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const since = searchParams.get('since')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  markAsRead(userId)

  const messages = getMessages(userId, since ? Number(since) : undefined)
  const profile = getUserProfile(userId)

  return NextResponse.json({ messages, profile })
}
