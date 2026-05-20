import type { Message } from '@/modules/message'
import { cn } from '@/shared/lib'
import { Camera, Phone, Video } from 'lucide-react'
import { memo } from 'react'

export type CallDurationMessageProp = {
  message: Message
}

export const CallDurationMessage = memo(({ message }: CallDurationMessageProp) => {
  console.log('[CallDurationMessage]', { message })
  if (message.type !== 'call_duration') return null
  return (
    <div
      className={cn('w-full flex flex-row p-2', message?.isMine ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'px-3 py-2 rounded-lg flex items-center gap-3 w-fit flex',
          message?.isMine ? 'bg-blue-500' : 'bg-gray-300',
          'text-white '
        )}
      >
        <Phone className="size-5" />
        <div className="flex flex-col text-xs">
          <p>Incoming Call</p>
          <p className="text-base">{formatCallDuration(message.duration)}</p>
        </div>
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
