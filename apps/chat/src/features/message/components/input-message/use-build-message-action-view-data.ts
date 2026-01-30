'use client'

import { useMemo } from 'react'
import { useGetUserProfile } from '@/shared/hooks/accounts'
import type { MessageAction } from '@/modules/message'

interface MessageActionViewData {
  title: string
  content: string
}

export function useBuildMessageActionViewData(
  action: MessageAction | null
): MessageActionViewData | null {
  if (!action) return null

  const message = action.message

  const replyUserId = action.type === 'REPLY' ? message.sender : undefined

  const { data: profile } = useGetUserProfile(replyUserId)

  return useMemo(() => {
    switch (action.type) {
      case 'EDIT':
        return {
          title: 'Edit Message',
          content: message.type === 'text' ? (message.content ?? '') : ''
        }

      case 'REPLY': {
        const fullName =
          [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Unknown'

        return {
          title: `Reply to ${fullName}`,
          content: message.type === 'text' ? (message.content ?? '') : ''
        }
      }

      default:
        return null
    }
  }, [action.type, message, profile?.firstName, profile?.lastName])
}
