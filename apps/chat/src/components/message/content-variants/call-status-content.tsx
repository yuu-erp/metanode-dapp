import { memo } from 'react'
import type { WithMessage } from '../types'
import { Phone } from 'lucide-react'
import { cn } from '@/shared/lib'
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'

export const CallStatusContent = memo(({ data }: WithMessage) => {
  const { onVideoCall } = useGoToMeetingView()
  return (
    <div
      className={cn('px-3 py-2 rounded-lg flex items-center gap-3 w-fit flex')}
      onClick={onVideoCall}
    >
      <Phone className="size-5" />
      <div className="flex flex-col text-xs">
        <p>{data.callStatus}</p>
        {!!data.duration && ['incoming', 'outcoming'].includes(data.callStatus ?? '') && (
          <p className="text-base">{formatCallDuration(data?.duration)}</p>
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
