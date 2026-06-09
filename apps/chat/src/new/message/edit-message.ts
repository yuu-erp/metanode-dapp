import { container } from '@/container'
import { useCurrentState } from '@/hooks/use-current-state'
import { useMutation } from '@tanstack/react-query'
import { fullMessageToData } from './message.utils'
import { getMessageById } from './message-info'
import { getConversationKey } from '../conversation'
import { encryptMessage } from './crypto-message'

export function useEditMessage() {
  const { base, account } = useCurrentState()

  return useMutation({
    mutationFn: async ({ messageId, newContent }: { messageId: string; newContent: string }) => {
      if (!account) return
      const message = await getMessageById(messageId, base)
      const key = await getConversationKey(base)

      const data = fullMessageToData(message)
      const newData = {
        ...data,
        content: newContent
      }
      const encryptedMessage = await encryptMessage(newData, key, base)

      switch (base.type) {
        case 'p2p': {
          return container.userContract.editMessage({
            from: account.hiddenAddress,
            to: account.contractAddress,
            inputData: {
              _messageId: messageId,
              newEncryptedContent: encryptedMessage,
              newEncryptedContentForPartner: encryptedMessage,
              partnerContract: base.id
            }
          })
        }
        case 'group': {
          return container.groupContract.editMessage({
            from: account.hiddenAddress,
            to: base.id,
            inputData: {
              messageId: messageId,
              newEncryptedContent: encryptedMessage
            }
          })
        }
        case 'anonymous_group': {
          return container.anonymousGroupContract.editMessage({
            from: account.hiddenAddress,
            to: base.id,
            inputData: {
              messageId: messageId,
              newEncryptedContent: encryptedMessage
            }
          })
        }
        default:
          throw new Error('[useEditMessage] Invalid type')
      }
    }
  })
}
