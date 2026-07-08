import { useCopy } from '@/shared/hooks/use-copy'
import { useRoomStore } from '@app/call'
import { Copy, Forward } from 'lucide-react'
import { memo } from 'react'
import { useModalStore } from './modal.store'
import { ShareMeetingModal } from './ShareMeetingModal'

export const MeetingUrlModal = memo(() => {
  const open = useModalStore((s) => s.meetingUrl)
  const isMeeting = useRoomStore((s) => s.isMeeting)
  const url = useRoomStore((s) => {
    console.log('payloadpayloadpayload 1', s)
    const payload = {
      isCaller: false,
      caller: s.caller,
      callee: s.callee,
      isMeet: true,
      roomId: s.roomId
    }
    console.log('payloadpayloadpayload 2', payload)

    const query = new URLSearchParams(payload as any).toString()
    return `${location.host}/#/setup-meeting?${query}`
  })
  const onCopy = useCopy(url)
  console.log('hahahahahaa', { open, isMeeting })

  if (!open || !isMeeting) return null
  return (
    <div className="fixed right-5 bottom-10 z-20">
      <div className="w-60 flex flex-col items-center p-3 gap-3 overflow-hidden bg-white rounded-xl text-foreground">
        <p>Thêm thành viên</p>
        <div className="flex items-center gap-3 w-full">
          <Copy onClick={onCopy} className="size-4 shrink-0" />
          <p className="line-clamp-1">{url}</p>
        </div>
        <ShareMeetingModal url={url}>
          <div className="flex items-center gap-3 w-full">
            <Forward className="size-4 shrink-0" />
            <p className="line-clamp-1">Share</p>
          </div>
        </ShareMeetingModal>
      </div>
    </div>
  )
})
