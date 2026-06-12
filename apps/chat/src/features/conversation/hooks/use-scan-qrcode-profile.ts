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
      container.eventBus.emit('event.reload', false)
      await new Promise<void>((res) => setTimeout(() => res(), 500))

      const dataScan = await scanQr()
      const conversationService = container.conversationService
      const conversationId = JSON.parse(dataScan)
      const conversation = await conversationService.getConversationById(
        account,
        conversationId,
        'p2p'
      )
      if (!conversation) throw new Error('User không tồn tại')
      return conversation
    },

    onSuccess: (conversation) => {
      console.log('[Scan QR] SUCCESS:', conversation)
      container.eventBus.emit('event.reload', true)

      navigate({ to: '/$type/$id', params: { id: conversation.conversationId, type: 'p2p' } })
    },

    onError: (error) => {
      container.eventBus.emit('event.reload', true)
      console.error('[Scan QR] ERROR:', error)
    }
  })
}
