import { NextResponse } from 'next/server'
import { listConversations } from '@/lib/messageStore'

export async function GET() {
  return NextResponse.json({ conversations: listConversations() })
}
