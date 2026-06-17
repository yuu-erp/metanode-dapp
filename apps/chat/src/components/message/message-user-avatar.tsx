import { memo } from 'react'
import type { WithMessage } from './types'
import AvatarUser from '@/shared/components/avatar-user'
import { useName } from '@/new/user/user-info'

export const MessageUserAvatar = memo(({ data }: WithMessage) => {
  const { name } = useName(data.sender)

  return (
    <div className="text-xs font-bold">
      <AvatarUser size="sm" name={name} type={'p2p'} />
    </div>
  )
})
