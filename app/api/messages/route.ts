import { NextResponse } from 'next/server'
import { getMessages, markAsRead, getUserProfile } from '@/lib/messageStore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const since = searchParams.get('since')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  await markAsRead(userId)

  const [messages, profile] = await Promise.all([
    getMessages(userId, since ? Number(since) : undefined),
    getUserProfile(userId),
  ])

  return NextResponse.json({ messages, profile })
}
