'use client'
import * as React from 'react'
import { useGetUserProfile } from '@/shared/hooks/accounts'
import AvatarUser from '@/shared/components/avatar-user'
import { USER_DEFAULT } from '@/constants/navbar-menu.constant'

interface ForwardMessageProps {
  forwardFrom?: string
}
function ForwardMessage({ forwardFrom }: ForwardMessageProps) {
  if (!forwardFrom) return null
  const { data: profile } = useGetUserProfile(forwardFrom)
  const displayName =
    [profile?.firstName, profile?.lastName]
      .map((v) => v?.trim())
      .filter(Boolean)
      .join(' ') || USER_DEFAULT
  return (
    <div className="flex gap-1 items-center flex-wrap min-w-0 pb-3 text-sm text-white">
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
