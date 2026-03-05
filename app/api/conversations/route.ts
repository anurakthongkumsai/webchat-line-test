import { NextResponse } from 'next/server'
import { listConversations } from '@/lib/messageStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  const conversations = await listConversations()
  return NextResponse.json({ conversations })
}
