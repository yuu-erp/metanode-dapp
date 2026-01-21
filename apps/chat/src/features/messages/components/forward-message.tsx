'use client'

import AvatarUser from '@/shared/components/avatar-user'
import { useGetUserProfile } from '@/shared/hooks/accounts'
import { Forward } from 'lucide-react'
import * as React from 'react'

interface ForwardMessageProps {
  sender: string
  type: 'text' | 'sticker'
  textPreview?: string
  stickerPreview?: string
  isMine?: boolean
}

function ForwardMessage({ sender, type, textPreview }: ForwardMessageProps) {
  const { data: profile, isLoading } = useGetUserProfile(sender)

  const senderName = React.useMemo(() => {
    if (!profile) return 'Unknown user'

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ')

    if (fullName) return fullName
    return sender.slice(0, 6) + '...'
  }, [profile, sender])

  const renderContent = () => {
    switch (type) {
      case 'text':
        return <p className="whitespace-pre-wrap break-words font-normal">{textPreview}</p>
      default:
        return <p className="text-sm opacity-70">[Tin nhắn không hỗ trợ]</p>
    }
  }

  if (isLoading) return null

  return (
    <React.Fragment>
      <div className="mb-1 flex items-center gap-1 text-sm">
        <Forward className="size-4" />
        <span>Forwarded from</span>
        <AvatarUser name={senderName} avatarSize={20} textSize={10} />
        <span className="font-semibold not-italic">{senderName}</span>
      </div>
      <div className="text-base">{renderContent()}</div>
    </React.Fragment>
  )
}

export default React.memo(ForwardMessage)
