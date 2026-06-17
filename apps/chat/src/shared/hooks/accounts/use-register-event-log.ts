import { useGetConversations } from '@/features/conversation'
import { useCurrentAccount } from '../use-current-account'
import { useEffect, useRef } from 'react'
import { container } from '@/container'
import { getStatusConnected, sendCommand } from '@metanodejs/system-core'
import { formatAddress } from '@/shared/utils'

async function connectNode(address: string) {
  if (window?.fiaiSDK) return
  const { status } = await getStatusConnected()
  if (!!status) return

  await sendCommand('connectNode', {
    wallets: [{ address }], // <== object array thay vì string array
    node: { ip: '139.59.243.85', port: 4200 }
  })
}

export function useRegisterEventLog() {
  const { data: account } = useCurrentAccount()
  const isRegister = useRef(new Set<string>())
  const addressRef = useRef('')

  const promise = useRef<Promise<any> | null>(null)

  const { data: listConversation } = useGetConversations(account)
  useEffect(() => {
    if (!account) return

    if (addressRef.current !== account.address) {
      addressRef.current = account.address
      promise.current = connectNode(account.address)
    }

    promise.current?.then(async () => {
      listConversation?.forEach((c) => {
        const id = formatAddress(c.conversationId)

        if (c.conversationType !== 'group' && c.conversationType !== 'anonymous_group') return
        if (isRegister.current.has(id)) return
        isRegister.current.add(id)
        container.eventLogContainer.eventLog.registerEvent(account?.address, [id])
      })
    })
  }, [listConversation, account])
}
