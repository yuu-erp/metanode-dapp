import AvatarUser from '@/shared/components/avatar-user'
import { useUser } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { memo } from 'react'
import { MemberItemContextMenu } from './detail/member-item-context-menu'

export type GroupMentionPick = { id: string; display: string }

export type GroupMemberItemProps = {
  user: string
  onClick?: (mention: GroupMentionPick) => void
  isFirst?: boolean
}

export const GroupMemberItem = memo(({ user, onClick, isFirst }: GroupMemberItemProps) => {
  const { data } = useUser(user)
  const handleClick = () => {
    const name = data?.name?.trim()
    const display = name && name.length > 0 ? name : `${user.slice(0, 6)}…${user.slice(-4)}`
    onClick?.({ id: user, display })
  }
  return (
    <MemberItemContextMenu user={user}>
      <div
        className={cn('py-3 flex gap-3 items-center', !isFirst && 'border-t border-[#ffffff44]')}
        onClick={handleClick}
      >
        <AvatarUser size={'sm'} name={data?.name ?? ''} />
        <p className="text-sm font-bold">{data?.name}</p>
      </div>
    </MemberItemContextMenu>
  )
})
