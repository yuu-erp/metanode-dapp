'use client'
import type { ConversationType } from '@/modules/conversation'
import AvatarUser from '@/shared/components/avatar-user'
import { useI18N } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import * as React from 'react'

interface ConversationContactProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar?: string
  name: string
  username?: string
  type?: ConversationType
  isPrivate?: boolean
}
function ConversationContact({
  name,
  username,
  type = 'p2p',
  className,
  isPrivate,
  ...props
}: ConversationContactProps) {
  const { t } = useI18N()
  return (
    <React.Fragment>
      <div
        className={cn(
          'flex flex-1 items-center gap-2 text-left text-sm h-full max-h-[68px] overflow-hidden text-black/80',
          className
        )}
        {...props}
      >
        <AvatarUser size="lg" url="" name={name} type={type} />
        <div className="grid flex-1 text-left text-sm leading-tight h-full">
          <div className="text-base font-bold flex-1 line-clamp-1 break-all">
            {isPrivate ? t(name) : name}
          </div>
          {username && (
            <div className="flex-1 text-xs break-all text-black/50 line-clamp-1">@{username}</div>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ConversationContact)
