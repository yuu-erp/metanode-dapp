import { useCallStore, useRoomStore } from '@app/call'
import { UserPlus } from 'lucide-react'
import { memo, useRef, useState } from 'react'
import { JoinRequetItem } from './join-requet-item'

export type Requester = {
  address: string
  name: string
  avatar: string
  hiddenAddress: string
}

export const JoinRequest = memo(() => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const requesters = useCallStore((s) => s.requesters)
  const isCaller = useRoomStore((s) => s.isCaller)

  if (!requesters.length || !isCaller) return null
  return (
    <div className="relative" ref={ref}>
      <div
        className="px-3 py-2 w-40 text-sm bg-[#7bf1a8] rounded-full flex items-center gap-2 text-black"
        onClick={() => setOpen((prev) => !prev)}
      >
        <UserPlus className="size-4" />
        <p>{`Admit ${requesters.length} guest`}</p>
      </div>

      {open && (
        <div
          className="
            absolute top-12 right-0
            animate-in fade-in zoom-in-95
            z-20
          "
        >
          <div className="flex flex-col gap-5 shadow-lg p-3 bg-card-foreground backdrop-blur rounded-lg">
            <p>Waiting to join </p>
            <div className="flex flex-col gap-3">
              {requesters.map((requester) => (
                <JoinRequetItem user={requester} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
