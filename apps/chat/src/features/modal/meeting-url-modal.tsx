import { useCopy } from '@/shared/hooks/use-copy'
import { useRoomStore } from '@app/call'
import { Copy } from 'lucide-react'
import { memo } from 'react'
import { useModalStore } from './modal.store'

export const MeetingUrlModal = memo(() => {
  const open = useModalStore((s) => s.meetingUrl)
  const isMeeting = useRoomStore((s) => s.isMeeting)
  const url = useRoomStore((s) => {
    const payload = {
      isCaller: false,
      caller: s.caller,
      calle: s.callee,
      isMeet: true,
      roomId: s.roomId
    }
    const query = new URLSearchParams(payload as any).toString()
    return `${location.host}/#/setup-meeting?${query}`
  })
  const onCopy = useCopy(url)

  if (!open || !isMeeting) return null
  return (
    <div className="fixed right-5 bottom-10 z-20">
      <div className="w-60 flex flex-col items-center p-3 gap-3 overflow-hidden bg-white rounded-xl text-foreground">
        <p>Thêm thành viên</p>
        <div className="flex items-center gap-3 w-full">
          <p className="line-clamp-1">{url}</p>
          <Copy onClick={onCopy} className="size-4 shrink-0" />
        </div>
      </div>
    </div>
  )
})
