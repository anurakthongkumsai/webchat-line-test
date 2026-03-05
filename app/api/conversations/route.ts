import { NextResponse } from 'next/server'
import { listConversations } from '@/lib/messageStore'

export async function GET() {
  const conversations = await listConversations()
  return NextResponse.json({ conversations })
}
