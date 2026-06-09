'use client'

import type { MessageAction } from '@/modules/message'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { useMemo } from 'react'

interface MessageActionViewData {
  title: string
  content: string
}

export function useBuildMessageActionViewData(
  action: MessageAction | null
): MessageActionViewData | null {
  if (!action) return null
  const { type } = useConversationParams()

  // const message = action.message
  const message = {}

  // const replyUserId = action.type === 'REPLY' ? message.sender : undefined
  // const conversationId = useGetConversationIdByAddress(replyUserId ?? '', type === 'group')

  // const { data: profile } = useGetUserProfile(type === 'group' ? conversationId : replyUserId)

  return useMemo(() => {
    switch (action.type) {
      case 'EDIT':
        return {
          title: 'Edit Message',
          // content: message.type === 'text' ? (message.content ?? '') : ''
          content: ''
        }

      case 'REPLY': {
        const fullName = ''
        // type === 'anonymous_group'
        //   ? replyUserId
        //   : [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Unknown'

        return {
          title: `Reply to ${fullName}`,
          // content: message.type === 'text' ? (message.content ?? '') : ''
          content: ''
        }
      }

      default:
        return null
    }
  }, [action.type, message])
}
