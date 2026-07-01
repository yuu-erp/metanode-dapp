import { container } from '@/container'
import { useMessageAction } from '@/features/message'
import { useCurrentState } from '@/hooks/use-current-state'
import { asyncPriorityQueue } from '@/modules/realtime'
import { getCurrentAccount, useCurrentAccount } from '@/shared/hooks'
import { compareAddress, formatAddress } from '@/shared/lib'
import { ACTIONS_QUERY_KEY } from '@/shared/lib/react-query'
import { type FileItem } from '@/stores/file.store'
import { useMutation } from '@tanstack/react-query'
import { prepareFile, uploadFile, type FileMetadata } from 'file-core'
import { v4 } from 'uuid'
import { getConversationKey } from '../conversation'
import { getGroupMemberList } from '../conversation/group'
import { getAlias } from '../conversation/my-info'
import { setFileMetadata } from '../file/file-info'
import { getCurrentIdentity } from '../me'
import { getUserContractAddress } from '../user/user-info'
import { encryptMessage } from './crypto-message'
import { addIdInMessageList, replaceIdInMessageList } from './list-mesage'
import { getMessageById, removeMessgeById, setMessageInfo } from './message-info'
import { fullMessageToData } from './message.utils'
import { contractClient } from '@mtnts/contract-client'
import { addConversation } from '../conversation/list-conversation'

export type SendMessageInput = { type: string; [key: string]: any }

async function sendMessageBC(input: any, base: BaseConversation) {
  const key = await getConversationKey(base)
  const account = await getCurrentAccount()
  const encryptedMessage = await encryptMessage(input, key, base)
  console.log('send 1', account)
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

async function createOptimisticMessage(
  input: SendMessageInput,
  base: BaseConversation,
  fileIds?: string[]
) {
  const id = v4()

  const optimisticMessage: FulleMessage = {
    ...input,
    id,
    sender: await getCurrentIdentity(base),
    timestamp: Date.now(),
    status: 'sending',
    isMine: true,
    reactions: []
  }

  if (fileIds) {
    optimisticMessage.fileIds = fileIds
  }

  addIdInMessageList(id, base)
  setMessageInfo(id, optimisticMessage)
  addConversation(base, { messageId: id })

  return optimisticMessage
}

export async function handleSendMessage(
  input: any,
  base: BaseConversation,
  files?: {
    ids: string[]
    readlIds: Promise<string[]>
  }
) {
  console.log('handleSendMessage 0', {
    ids: files?.ids,
    test: contractClient.froms
  })

  const fullMessage = await createOptimisticMessage(input, base, files?.ids)
  console.log('handleSendMessage 1', fullMessage)
  try {
    if (files) {
      const fileIds = await files.readlIds

      input.fileIds = fileIds
      fullMessage.fileIds = fileIds
      console.log('set optimistic file', fileIds)
      setMessageInfo(fullMessage.id, { fileIds })
    }

    return asyncPriorityQueue.add(async () => {
      const [messageId] = await Promise.all([
        waitSendMessageEvent(base),
        sendMessageBC(input, base)
      ])
      console.log('thanhduy - handleSendMessage 2')

      removeMessgeById(fullMessage.id)
      replaceIdInMessageList(fullMessage.id, messageId, base)

      const finalMessage = { ...fullMessage, id: messageId, status: 'delivered' }

      setMessageInfo(messageId, finalMessage)

      return messageId
    })
  } catch (error: any) {
    setMessageInfo(fullMessage.id, {
      status: 'failed',
      errorMessage: error?.message || 'unknown error'
      // isFailed: true
    })
  } finally {
    console.debug('end send =========> ', Date.now())
  }
}

export function useSendSticker() {
  const { base } = useCurrentState()
  const mutation = useMutation({
    mutationKey: ACTIONS_QUERY_KEY.sendMessage,
    mutationFn: (stickerId: string) =>
      handleSendMessage(
        {
          type: 'sticker',
          stickerId
        },
        base
      )
  })
  return { ...mutation, sendSticker: mutation.mutateAsync }
}

export function useForwardMessage() {
  const mutation = useMutation({
    mutationKey: ACTIONS_QUERY_KEY.sendMessage,
    mutationFn: async ({ messageId, base }: { messageId: string; base: BaseConversation }) => {
      setMessageAction(null)
      const message = await getMessageById(messageId, base)
      handleSendMessage(
        {
          ...fullMessageToData(message),
          forwardFrom: message.sender,
          forwardFromType: state.base.type
        },
        base
      )
    }
  })
  const state = useCurrentState()
  const { setMessageAction } = useMessageAction()

  return {
    ...mutation,
    forwardMessage: mutation.mutateAsync
  }
}

export function processFileV2(items: FileItem[]) {
  return async (msg: FulleMessage) => {
    try {
      const item = items[0]
      if (!item) return

      setFileMetadata(msg.id, item.meta)
      const file = item.file
      if (!file) return
      console.log('fileId 1')
      const fileId = ''
      // const fileId = await uploadFileV2(file, (v) =>
      //   uiActions.setUpFileProgress(msg.id, +(v * 0.9).toFixed(2))
      // )
      console.log('fileId 2')

      return { fileId }
    } catch (error) {
      console.error('upfile error', error)
      throw error
    }
  }
}

export type SendVoiceInput = {
  file: File
  metadata: Partial<FileMetadata>
}

export function useSendVoice() {
  const { base } = useCurrentState()
  const { account } = useCurrentAccount()

  const mutation = useMutation({
    mutationKey: ACTIONS_QUERY_KEY.sendMessage,
    mutationFn: async ({ file, metadata = {} }: SendVoiceInput) => {
      if (!account) return
      const id = prepareFile(file, metadata)
      const { promise } = uploadFile(id, account?.address)
      handleSendMessage(
        {
          type: 'voice'
        },
        base,
        { ids: [id], readlIds: promise }
      )
    }
  })

  return { ...mutation, sendVoice: mutation.mutateAsync }
}
