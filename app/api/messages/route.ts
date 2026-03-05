import { NextResponse } from 'next/server'
import { getMessages } from '@/lib/messageStore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since')

  const messages = getMessages(since ? Number(since) : undefined)
  return NextResponse.json({ messages })
}
