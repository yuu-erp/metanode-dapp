import { useGetConversations } from '@/features/conversation'
import { useCurrentAccount } from '../use-current-account'
import { useEffect, useRef } from 'react'
import { container } from '@/container'

export function useRegisterEventLog() {
  const { data: account } = useCurrentAccount()
  const isRegister = useRef(new Set<string>())

  const { data: listConversation } = useGetConversations(account)
  useEffect(() => {
    if (!account) return

    listConversation?.forEach((c) => {
      if (c.conversationType !== 'group' && c.conversationType !== 'anonymous_group') return
      if (isRegister.current.has(c.conversationId)) return
      isRegister.current.add(c.conversationId)
      container.eventLogContainer.eventLog.registerEvent(account?.address, [c.conversationId])
    })
  }, [listConversation, account])
}
