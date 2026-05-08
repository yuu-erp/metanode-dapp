'use client'
import type { MessageReaction } from '@/modules/message'
import { useCurrentAccount } from '@/shared/hooks'
import * as React from 'react'
import { useConversationParams } from './use-conversation-params'

export function useIsMineReaction() {
  const { data } = useCurrentAccount()
  const { type } = useConversationParams()

  return React.useCallback(
    (reaction: MessageReaction) => {
      if (type === 'group' || type === 'anonymous_group') {
        return reaction.users.includes(data?.address ?? '')
      }
      return reaction.users.includes(data?.contractAddress ?? '')
    },
    [type, data?.address, data?.contractAddress]
  )
}
