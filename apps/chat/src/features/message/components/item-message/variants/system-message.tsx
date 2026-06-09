import type { Message } from '@/modules/message'
import { useGetConversationByAddress } from '@/shared/hooks'
import { memo } from 'react'

export type SystemMessageProps = {
  message: Message
}

export const SystemMessage = memo(({ message }: SystemMessageProps) => {
  const user = useGetConversationByAddress(message.sender, 'p2p', true, false)
  console.log('user', { user, message })
  const text: Record<any, string> = {
    leave_group: `${user?.name} has left`
  }

  if (message.type !== 'system') return null
  return (
    <div className="px-2 py-1 bg-[#0000004d] rounded-lg mx-auto">
      <p className="text-sm">{text[message.eventName]}</p>
    </div>
  )
})
