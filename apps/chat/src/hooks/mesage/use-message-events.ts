import { container } from '@/container'
import { decodeBase64 } from '@/modules/message/utils'
import { addConversation } from '@/new/conversation/list-conversation'
import { getAlias } from '@/new/conversation/my-info'
import {
  createMessageInfoQuery,
  getMessageById,
  removeMessgeById,
  setMessageInfo
} from '@/new/message'
import { addIdInMessageList, removeIdInMessgeList } from '@/new/message/list-mesage'
import { setPinnedMessageState } from '@/new/message/pin-message'
import { addReaction, removeReaction } from '@/new/message/react-message'
import { useEventLog } from '@/shared/hooks/use-event-log'
import { compareAddress } from '@/shared/lib'
import {
  ACTIONS_QUERY_KEY,
  CONVERSATION_QUERY_KEY,
  MESSAGE_QUERY_KEY,
  queryClient
} from '@/shared/lib/react-query'
import { formatAddress } from '@/shared/utils'
import { useIsMutating } from '@tanstack/react-query'
import { useCurrentState } from '../use-current-state'

const eventBus = container.eventBus

export function useMessageEvents() {
  const sendMessagePendding = useIsMutating({ mutationKey: ACTIONS_QUERY_KEY.sendMessage })
  const { account } = useCurrentState()

  // pin
  useEventLog('MessagePinChanged', (e) => {
    setPinnedMessageState(
      {
        type: 'p2p',
        id: formatAddress(e.partner)
      },
      formatAddress(e.messageId),
      e.isPinned
    )
  })

  useEventLog('PartnerMessagePinChanged', (e) => {
    setPinnedMessageState(
      {
        type: 'p2p',
        id: formatAddress(e.pinnedBy)
      },
      formatAddress(e.messageId),
      e.isPinned
    )
  })

  useEventLog('PinnedMessagesUpdated', (e) => {
    setPinnedMessageState(
      {
        type: 'group',
        id: formatAddress(e.group)
      },
      formatAddress(e.messageId),
      e.isPinned
    )
  })

  useEventLog('MessagePinnedAnonymous', (e) => {
    setPinnedMessageState(
      {
        type: 'anonymous_group',
        id: formatAddress(e.group)
      },
      formatAddress(e.messageId),
      e.isPinned
    )
  })

  // new message
  async function handleLeaveGroup(id: string, base: BaseConversation) {
    const data = await getMessageById(id, base)
    if (data.kind === 'leave_group') {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEY.GROUP_MEMBERS(base.id) })
    }
  }

  useEventLog('MessageSent', (e) => {
    refetchInbox(e.recipient)

    addConversation(
      {
        type: 'p2p',
        id: e.recipient
      },
      { messageId: e.messageId }
    )
    if (sendMessagePendding && compareAddress(e.sender, account?.contractAddress)) return
    addIdInMessageList(e.messageId, {
      type: 'p2p',
      id: e.recipient
    })
  })

  function refetchInbox(id: string) {
    queryClient.invalidateQueries({
      queryKey: CONVERSATION_QUERY_KEY.inbox(id)
    })
  }

  useEventLog('MessageReceived', (e) => {
    eventBus.emit('noti:add', { type: 'message' })
    refetchInbox(e.sender)
    addConversation(
      {
        type: 'p2p',
        id: e.sender
      },
      { messageId: e.messageId }
    )
    addIdInMessageList(e.messageId, {
      type: 'p2p',
      id: e.sender
    })
  })

  useEventLog('MessageSentGroup', (e) => {
    refetchInbox(e.groupAddress)

    const isMine = compareAddress(e.sender, account?.address)
    if (!isMine) eventBus.emit('noti:add', { type: 'message' })
    if (sendMessagePendding && isMine) return
    const base = {
      type: 'group',
      id: e.groupAddress
    }
    addConversation(base, { messageId: e.messageId })
    addIdInMessageList(e.messageId, base)
    handleLeaveGroup(e.messageId, base)
  })

  useEventLog('AnonymousMessageStored', async (e) => {
    refetchInbox(e.group)

    const alias = await getAlias(e.group)
    const isMine = compareAddress(e.sender, alias)
    if (!isMine) eventBus.emit('noti:add', { type: 'message' })
    if (sendMessagePendding && isMine) return
    eventBus.emit('noti:add', { type: 'message' })
    const base = {
      type: 'anonymous_group',
      id: e.group
    }
    addConversation(base, { messageId: e.messageId })
    addIdInMessageList(e.messageId, base)
    handleLeaveGroup(e.messageId, base)
  })

  //reaction
  useEventLog('MessageReacted', async (e) => {
    addReaction(e.messageId, {
      reaction: decodeBase64(e.reaction),
      reactor: e.reactor
    })
  })

  useEventLog('MessageUnReacted', (e) => {
    removeReaction(e.messageId, e.reactor)
  })

  useEventLog('PartnerMessageReacted', async (e) => {
    addReaction(e.messageId, {
      reaction: decodeBase64(e.reaction),
      reactor: e.reactor
    })
  })

  useEventLog('PartnerMessageUnReacted', (e) => {
    removeReaction(e.messageId, e.reactor)
  })

  useEventLog('MessageReactedGroup', async (e) => {
    addReaction(e.messageId, {
      reaction: decodeBase64(e.reaction),
      reactor: e.reactor
    })
  })

  useEventLog('MessageUnReactedGroup', (e) => {
    removeReaction(e.messageId, e.reactor)
  })

  useEventLog('MessageReactedAnonymous', async (e) => {
    addReaction(e.messageId, {
      reaction: decodeBase64(e.reaction),
      reactor: e.reactor
    })
  })

  useEventLog('MessageUnReactedAnonymous', (e) => {
    removeReaction(e.messageId, e.reactor)
  })

  //edit message
  async function forceEdit(id: string, input: BaseConversation) {
    const message = await queryClient.fetchQuery(createMessageInfoQuery(id, input))
    setMessageInfo(id, { isEdited: true, content: message.content })
  }

  useEventLog('PartnerMessageEdited', (e) => {
    // forceEdit(e.messageId, { type: 'p2p', id: e.sender })
    queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(e.messageId) })
  })

  useEventLog('MessageEdited', (e) => {
    queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(e.messageId) })
    // forceEdit(e.messageId, { type: 'p2p', id: e.recipient })
  })

  useEventLog('MessageEditedGroup', (e) => {
    queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(e.messageId) })
    // forceEdit(e.messageId, { type: 'group', id: e.groupAddress })
  })

  useEventLog('MessageEditedAnonymous', (e) => {
    // queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(e.messageId) })
    forceEdit(e.messageId, { type: 'anonymousGroup', id: e.groupAddress })
  })

  //delete message
  function removeMessage(messageId: string, conversationId: string) {
    removeIdInMessgeList(messageId, conversationId)
    removeMessgeById(messageId)
  }

  useEventLog('MessageDeleted', (e) => {
    removeMessage(e.messageId, e.recipient)
  })

  useEventLog('PartnerMessageDeleted', (e) => {
    removeMessage(e.messageId, e.sender)
  })

  useEventLog('MessageDeletedGroup', (e) => {
    removeMessage(e.messageId, e.groupAddress)
  })

  useEventLog('MessageDeletedAnonymous', (e) => {
    removeMessage(e.messageId, e.groupAddress)
  })

  // message read
  useEventLog('MessageReadByPartner', (e) => {
    setMessageInfo(e.messageId, {
      isRead: true
    })
  })

  useEventLog('MessageRead', (e) => {
    setMessageInfo(e.messageId, {
      isRead: true
    })
  })

  useEventLog('MessageReadAnonymous', (e) => {
    setMessageInfo(e.messageId, {
      isRead: true
    })
  })
}
