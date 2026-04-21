'use client'
import type { OnChainReplyReference, ReplyReference } from '@/modules/message'
import { useGetUserProfile } from '@/shared/hooks/accounts'
import * as React from 'react'
import ReplyMessageView from './reply-message-view'

interface ReplyMessageProps {
  replyTo?: ReplyReference | OnChainReplyReference
  isMine?: boolean
}
function ReplyMessage({ replyTo, isMine }: ReplyMessageProps) {
  if (!replyTo || !('type' in replyTo)) return null
  const { data: profile } = useGetUserProfile(replyTo.sender)
  return (
    <ReplyMessageView
      replyTo={replyTo}
      replyToUser={[profile?.firstName, profile?.lastName].filter(Boolean).join(' ')}
      isMine={isMine}
    />
  )
}

export default React.memo(ReplyMessage)
