import type { Message } from '@/modules/message'
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'
import { cn } from '@/shared/lib'
import { Phone } from 'lucide-react'
import { memo } from 'react'

export type CallStatusItemProp = {
  message: Message
}

export const CallStatusItem = memo(({ message }: CallStatusItemProp) => {
  console.log('[CallStatusItem]', { message })
  const { onVideoCall } = useGoToMeetingView()

  const { callStatus } = message ?? {}

  if (message.type !== 'call_status' || !message.isMine) return null
  return (
    <div
      className={cn('px-3 py-2 rounded-lg flex items-center gap-3 w-fit flex')}
      onClick={onVideoCall}
    >
      <Phone className="size-5" />
      <div className="flex flex-col text-xs">
        <p>{message.callStatus}</p>
        {!!message.duration && ['incoming', 'outcoming'].includes(callStatus) && (
          <p className="text-base">{formatCallDuration(message.duration)}</p>
        )}
      </div>
    </div>
  )
})

function formatCallDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return `${m}:${String(s).padStart(2, '0')}`
}
