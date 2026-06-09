'use client'

import { container } from '@/container'
import { createGetConversationIdQueryOptions, useCurrentAccount } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { queryClient } from '@/shared/lib/react-query'
import type { FileItem } from '@/stores/file.store'
import { useMutation } from '@tanstack/react-query'

/**
 * Variables cho mutation
 * – dùng trực tiếp SendPayload (single source of truth)
 */

export function useSendFile(messageType: string = 'file') {
  const { data: account } = useCurrentAccount()
  const { id, type } = useConversationParams()

  return useMutation({
    mutationFn: async ({ files, content = '' }: { files: FileItem[]; content?: string }) => {
      if (!account || !id || !type) return
      const conversation = await queryClient.ensureQueryData(
        createGetConversationIdQueryOptions(id, type, false)
      )
      if (!conversation) return
      const messageService = container.messageService
      return messageService.sendFile(account, conversation, files, messageType, content)
    },

    onMutate: () => {
      console.log('[useSendFile] sending:')
    },

    onSuccess: (messageId) => {
      console.log('[useSendFile] Send file successfully ✅', messageId)
    },

    onError: (error) => {
      console.error('[useSendFile] Send file error ❌', error)
    }
  })
}
