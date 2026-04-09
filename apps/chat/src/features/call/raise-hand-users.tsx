import { useProfileByAddress } from '@/shared/hooks/conversations/use-user-by-address'
import { useRoomStore, useUserStore } from '@app/call'
import { Hand } from 'lucide-react'
import { memo } from 'react'

export type RaiseHandUser = {
  address: string
  name: string
  hiddenAddress: string
}

export const RaiseHandUsers = memo(() => {
  const raiseHandUsers = useUserStore((s) => s.raiseHandUsers)

  if (!raiseHandUsers.length) return null
  const user = raiseHandUsers[0]

  return (
    <div>
      <div className="px-3 py-2 w-40 text-sm bg-[#7bf1a8] rounded-full flex items-center gap-2 text-black">
        <Hand className="size-4" />
        <UserName user={user} total={raiseHandUsers.length} />
      </div>
    </div>
  )
})

const UserName = ({ user, total }: { user: string; total: number }) => {
  const { address } = useRoomStore()
  const { data } = useProfileByAddress(address, user)

  return (
    <p className="line-clamp-1">{`${`${data?.firstName} ${data?.lastName}`} ${total > 1 ? `+ ${total - 1} mores` : ''}`}</p>
  )
}
