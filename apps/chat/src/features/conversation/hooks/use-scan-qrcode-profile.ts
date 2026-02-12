'use client'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import { scanQr } from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useScanQrcodeProfile() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (account: Account) => {
      // giả lập API scan QR
      const dataScan = await scanQr()
      const conversationService = container.conversationService
      const conversationId = JSON.parse(dataScan)
      const conversation = await conversationService.getConversationById(
        account.address,
        conversationId,
        'p2p'
      )
      if (!conversation) throw new Error('User không tồn tại')
      return conversation
    },

    onSuccess: (conversation) => {
      console.log('[Scan QR] SUCCESS:', conversation)
      navigate({ to: '/p2p/$id', params: { id: conversation.conversationId } })
    },

    onError: (error) => {
      console.error('[Scan QR] ERROR:', error)
    }
  })
}
