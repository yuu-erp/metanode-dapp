import AvatarUser from '@/shared/components/avatar-user'
import ButtonBase from '@/shared/components/button/button-base'
import { useProfileByAddress } from '@/shared/hooks/conversations/use-user-by-address'
import { useRoomParticipantApproval, useRoomStore } from '@app/call'
import { memo } from 'react'

export type JoinRequetItemProps = {
  user: string
}

export const JoinRequetItem = memo(({ user }: JoinRequetItemProps) => {
  const { address } = useRoomStore()
  const { data } = useProfileByAddress(address, user)

  const { admit, deny } = useRoomParticipantApproval(user)

  const name = `${data?.firstName}`

  if (!name) return null
  return (
    <div className="flex items-center gap-3">
      <AvatarUser name={name} size={'sm'} />
      <p className="flex-1 line-clamp-1">{name}</p>

      <div className="flex gap-1 ml-5">
        <ButtonBase onClick={admit} className="w-16 h-8 text-xs">
          Admit
        </ButtonBase>
        <ButtonBase onClick={deny} className="w-16 h-8 text-xs">
          Deny
        </ButtonBase>
      </div>
    </div>
  )
})
