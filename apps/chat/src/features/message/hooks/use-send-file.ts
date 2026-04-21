'use client'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { useMutation } from '@tanstack/react-query'

/**
 * Variables cho mutation
 * – dùng trực tiếp SendPayload (single source of truth)
 */
export interface SendFileVariables {
  account: Account
  conversation: Conversation
  files: File[]
}
export function useSendFile() {
  return useMutation<void, Error, SendFileVariables>({
    mutationFn: async ({ account, conversation, files }) => {
      const messageService = container.messageService
      return messageService.sendFile(account, conversation, files)
    },

    onMutate: ({ files }) => {
      console.log('[useSendFile] sending:', files)
    },

    onSuccess: (messageId) => {
      console.log('[useSendFile] Send file successfully ✅', messageId)
    },

    onError: (error) => {
      console.error('[useSendFile] Send file error ❌', error)
    }
  })
}
