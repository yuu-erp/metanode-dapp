import { container } from '@/container'
import { decodeBase64 } from '@/modules/message/utils'
import { getAlias } from '@/new/conversation/my-info'
import { addIdInMessageList, removeIdInMessgeList } from '@/new/message/list-mesage'
import { setPinnedMessageState } from '@/new/message/pin-message'
import { addReaction, removeReaction } from '@/new/message/react-message'
import { useEventLog } from '@/shared/hooks/use-event-log'
import { compareAddress } from '@/shared/lib'
import { ACTIONS_QUERY_KEY, MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { formatAddress } from '@/shared/utils'
import { useIsMutating } from '@tanstack/react-query'
import { useCurrentState } from '../use-current-state'
import { removeMessgeById, setMessageInfo } from '@/new/message'
import { addConversation } from '@/new/conversation/list-conversation'

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
  useEventLog('MessageSent', (e) => {
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

  useEventLog('MessageReceived', (e) => {
    eventBus.emit('noti:add', { type: 'message' })
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
    const isMine = compareAddress(e.sender, account?.address)
    if (!isMine) eventBus.emit('noti:add', { type: 'message' })
    if (sendMessagePendding && isMine) return
    addConversation(
      {
        type: 'group',
        id: e.groupAddress
      },
      { messageId: e.messageId }
    )

    addIdInMessageList(e.messageId, {
      type: 'group',
      id: e.groupAddress
    })
  })

  useEventLog('AnonymousMessageStored', async (e) => {
    const alias = await getAlias(e.group)
    const isMine = compareAddress(e.sender, alias)
    if (!isMine) eventBus.emit('noti:add', { type: 'message' })
    if (sendMessagePendding && isMine) return
    eventBus.emit('noti:add', { type: 'message' })
    addConversation(
      {
        type: 'anonymous_group',
        id: e.group
      },
      { messageId: e.messageId }
    )
    addIdInMessageList(e.messageId, {
      type: 'anonymous_group',
      id: e.group
    })
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
  useEventLog('PartnerMessageEdited', (e) => {
    queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(e.messageId) })
  })

  useEventLog('MessageEdited', (e) => {
    queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(e.messageId) })
  })

  useEventLog('MessageEditedAnonymous', (e) => {
    queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(e.messageId) })
  })

  useEventLog('MessageEditedAnonymous', (e) => {
    queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(e.messageId) })
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
