import ChatBox from '@/components/ChatBox'

export default function ChatPage({ params }: { params: { userId: string } }) {
  return <ChatBox userId={params.userId} />
}
