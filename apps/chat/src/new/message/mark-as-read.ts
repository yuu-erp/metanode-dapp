import { useEffect, useRef } from 'react'
import { useMessaeges } from './list-mesage'
import { getMessageById } from './message-info'
import { useCurrentState } from '@/hooks/use-current-state'
import { container } from '@/container'
import { asyncPriorityQueue } from '@/modules/realtime'

export function useMarkAsReadv2() {
  const { ids } = useMessaeges()
  const { base, account } = useCurrentState()
  const readSet = useRef(new Set<string>())

  useEffect(() => {
    ;(async () => {
      if (!account) return

      const unRead: string[] = []
      const set = readSet.current
      await Promise.all(
        ids.map(async (id) => {
          if (set.has(id)) return
          const message = await getMessageById(id, base)
          if (message.isMine) return
          set.add(id)
          unRead.push(id)
        })
      )
      if (!unRead.length) return
      asyncPriorityQueue.add(async () => {
        switch (base.type) {
          case 'p2p': {
            await container.userContract.markMessagesAsRead({
              from: account.address,
              to: account.contractAddress,
              inputData: {
                messageIds: unRead,
                partnerContract: base.id
              }
            })
            break
          }
          case 'group':
          case 'anonymous_group': {
            await container.groupContract.markMessagesAsRead({
              from: account.address,
              to: base.id,
              inputData: {
                messageIds: unRead
              }
            })
            break
          }
        }
      })
    })()
  }, [ids, account])
}
