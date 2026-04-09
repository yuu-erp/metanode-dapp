'use client'
import { USER_DEFAULT } from '@/constants/navbar-menu.constant'
import AvatarUser from '@/shared/components/avatar-user'
import { useCurrentConversationType } from '@/shared/hooks'
import { useGetUserProfile } from '@/shared/hooks/accounts'
import { cn } from '@/shared/lib'
import * as React from 'react'

interface ForwardMessageProps {
  forwardFrom?: string
  isMine?: boolean
}
function ForwardMessage({ forwardFrom, isMine }: ForwardMessageProps) {
  if (!forwardFrom) return null
  const { data: profile } = useGetUserProfile(forwardFrom)
  const type = useCurrentConversationType()

  const displayName =
    type === 'anonymous_group'
      ? 'Forwarded message'
      : [profile?.firstName, profile?.lastName]
          .map((v) => v?.trim())
          .filter(Boolean)
          .join(' ') || USER_DEFAULT

  return (
    <div
      className={cn(
        'flex gap-1 items-center flex-wrap min-w-0 pb-3 text-sm',
        isMine ? 'text-white' : 'text-gray-800'
      )}
    >
      <span className="shrink-0">Forwarded from</span>

      <div className="flex items-center gap-1 min-w-0">
        <div className="shrink-0">
          <AvatarUser name={displayName} avatarSize={24} textSize={12} />
        </div>

        <span className="whitespace-nowrap font-semibold">{displayName}</span>
      </div>
    </div>
  )
}

export default React.memo(ForwardMessage)
