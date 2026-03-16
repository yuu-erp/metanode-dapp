'use client'
import type { MessageReaction } from '@/modules/message'
import { useCurrentAccount, useCurrentConversationType } from '@/shared/hooks'
import * as React from 'react'

export function useIsMineReaction() {
  const { data } = useCurrentAccount()
  const type = useCurrentConversationType()

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
