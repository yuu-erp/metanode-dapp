import { container } from '@/container'
import { useMessageAction } from '@/features/message'
import { useCurrentState } from '@/hooks/use-current-state'
import { useHandleFile } from '@/hooks/useHandleFile'
import { asyncPriorityQueue } from '@/modules/realtime'
import { getCurrentAccount } from '@/shared/hooks'
import { compareAddress, formatAddress } from '@/shared/lib'
import { ACTIONS_QUERY_KEY } from '@/shared/lib/react-query'
import { type FileItem } from '@/stores/file.store'
import { useMutation } from '@tanstack/react-query'
import { v4 } from 'uuid'
import { getConversationKey } from '../conversation'
import { getGroupMemberList } from '../conversation/group'
import { getAlias } from '../conversation/my-info'
import { setFileMetadata } from '../file/file-info'
import { getUserContractAddress } from '../user/user-info'
import { encryptMessage } from './crypto-message'
import { addIdInMessageList, replaceIdInMessageList } from './list-mesage'
import { getMessageById, removeMessgeById, setMessageInfo } from './message-info'
import { fullMessageToData, getSender } from './message.utils'

export type SendMessageInput = { type: string; [key: string]: any }

async function sendMessageBC(input: any, base: BaseConversation) {
  const key = await getConversationKey(base)
  const account = await getCurrentAccount()
  const encryptedMessage = await encryptMessage(input, key, base)
  console.log('send 1')
  switch (base.type) {
    case 'p2p': {
      return container.userContract.sendMessage({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: {
          _recipientContractAddress: base.id,
          _encryptedContentForRecipient: encryptedMessage,
          _encryptedContentForSelf: encryptedMessage
        }
      })
    }
    case 'group': {
      const memberList = await getGroupMemberList(base)
      const data = await Promise.all(
        memberList.map(async (mem) => {
          const contractAddress = await getUserContractAddress(mem)
          const settings = await container.userContract.detailedSettings({
            from: account.hiddenAddress,
            to: contractAddress
          })

          return { ...settings, contractAddress, address: mem }
        })
      )

      const enabledUsers = data.filter((i) => i.p2pChatEnabled)

      return container.groupContract.sendMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: {
          encryptedContent: encryptedMessage,
          recipientContracts: enabledUsers.map((i) => i.contractAddress),
          recipientOwners: enabledUsers.map((i) => i.address)
        }
      })
    }

    case 'anonymous_group': {
      return container.anonymousGroupContract.sendMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: { encryptedContent: encryptedMessage }
      })
    }
    default:
      throw new Error('[sendMessageBC] Invalid type')
  }
}

const waitSendMessageEvent = async (base: BaseConversation) => {
  const account = await getCurrentAccount()
  const names = {
    p2p: 'MessageSent',
    group: 'MessageSentGroup',
    anonymous_group: 'AnonymousMessageStored'
  }

  const filters = {
    p2p: (e) => compareAddress(e.sender, account.contractAddress),
    group: (e) => compareAddress(e.sender, account.address),
    anonymous_group: async (e) => compareAddress(e.sender, await getAlias(base.id))
  }
  const name = names[base.type]
  const filter = filters[base.type]
  return new Promise<string>((res) => {
    //@ts-ignore
    const off = container.eventLogContainer.eventLog.on(name, (e) => {
      if (!filter(e)) return
      off()
      res(formatAddress(e.messageId))
    })
  })
}

async function createOptimisticMessage(input: SendMessageInput, base: BaseConversation) {
  const id = v4()

  const optimisticMessage: FulleMessage = {
    ...input,
    id,
    sender: await getSender(base),
    timestamp: Date.now() + '',
    status: 'sending',
    isMine: true,
    fileId: input.type === 'file' ? id : '',
    reactions: []
  }
  addIdInMessageList(id, base)
  setMessageInfo(id, optimisticMessage)

  return optimisticMessage
}

async function handleSendMessage(
  input: any,
  base: BaseConversation,
  transformInput?: (message: FulleMessage) => Promise<any> | any
) {
  const fullMessage = await createOptimisticMessage(input, base)

  try {
    const custom = transformInput ? await transformInput(fullMessage) : {}
    console.log('thanhduy - handleSendMessage 1')
    return asyncPriorityQueue.add(async () => {
      const [messageId] = await Promise.all([
        waitSendMessageEvent(base),
        sendMessageBC({ ...input, ...custom }, base)
      ])
      console.log('thanhduy - handleSendMessage 2')

      removeMessgeById(fullMessage.id)
      replaceIdInMessageList(fullMessage.id, messageId, base)

      setMessageInfo(messageId, { ...fullMessage, ...custom, id: messageId, status: 'delivered' })

      return messageId
    })
  } catch (error) {
    setMessageInfo(fullMessage.id, {
      status: 'failed'
      // isFailed: true
    })
  }
}

export function useSendMessage() {
  return useMutation({
    mutationKey: ACTIONS_QUERY_KEY.sendMessage,
    mutationFn: ({
      input,
      base,
      transformInput
    }: {
      input: any
      base: BaseConversation
      transformInput?: (message: FulleMessage) => Promise<any> | any
    }) => handleSendMessage(input, base, transformInput)
  })
}

export function useSendSticker() {
  const { base } = useCurrentState()
  const mutation = useSendMessage()
  return {
    ...mutation,
    sendSticker: (stickerId: string) =>
      mutation.mutate({
        input: {
          type: 'sticker',
          stickerId
        },
        base
      })
  }
}

export function useForwardMessage() {
  const mutation = useSendMessage()
  const state = useCurrentState()
  const { setMessageAction } = useMessageAction()

  return {
    ...mutation,
    forwardMessage: async ({ messageId, base }: { messageId: string; base: BaseConversation }) => {
      setMessageAction(null)
      const message = await getMessageById(messageId, base)

      await mutation.mutateAsync({
        input: {
          ...fullMessageToData(message),
          forwardFrom: message.sender,
          forwardFromType: state.base.type
        },
        base
      })
    }
  }
}

// export function processFile(items: FileItem[]) {
//   return async (msg: FulleMessage) => {
//     try {
//       console.log('thanhduy - processFile 1')

//       const item = items[0]
//       console.log('item', item)
//       if (!item) return

//       setFileMetadata(msg.id, item.meta)
//       const file = item.file
//       console.log('thanhduy - processFile 2', file)
//       if (!file) return

//       const fileId = await uploadFileV2(file, (v) =>
//         uiActions.setUpFileProgress(msg.id, +(v * 0.9).toFixed(2))
//       )

//       // const fileId = await fileHandler.uploadFile(item, {
//       //   owner: account.address,
//       //   hiddenAddress: account.hiddenAddress,
//       //   clientId: msg.id,
//       //   onProgress: (v) => uiActions.setUpFileProgress(msg.id, +(v * 0.9).toFixed(2))
//       // })
//       console.log('thanhduy - processFile 3')

//       return { fileId }
//     } catch (error) {
//       console.error('upfile error', error)
//       throw error
//     }
//   }
// }

export function processFileV2(items: FileItem[], handlePushFiles: any) {
  return async (msg: FulleMessage) => {
    try {
      const account = await getCurrentAccount()
      const item = items[0]
      console.log('item', item)
      if (!item) return

      setFileMetadata(msg.id, item.meta)
      const file = item.file
      console.log('thanhduy - processFile 2', file)
      if (!file) return

      // const fileId = await uploadFileV2(file, (v) =>
      //   uiActions.setUpFileProgress(msg.id, +(v * 0.9).toFixed(2))
      // )

      const fileIds = await handlePushFiles(account.address, [file as any])
      const fileId = fileIds[0]

      return { fileId }
    } catch (error) {
      console.error('upfile error', error)
      throw error
    }
  }
}

export function useSendVoice() {
  const mutation = useSendMessage()
  const { base } = useCurrentState()
  const { handlePushFiles } = useHandleFile()

  return {
    ...mutation,
    sendVoice: async (fileItem: FileItem) => {
      await mutation.mutateAsync({
        input: {
          type: 'voice'
        },
        base,
        transformInput: processFileV2([fileItem], handlePushFiles)
      })
    }
  }
}
