'use client'
import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import type { Message } from '@/modules/message'
import { useCurrentAccount } from '@/shared/hooks'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { formatAddress } from '@/shared/utils'
import type { AppEvents } from '@/types/app-events'
import type { InfiniteData } from '@tanstack/react-query'
import * as React from 'react'
import {
  applyMessageDelete,
  applyMessageSent,
  applyMessageUpdate,
  applyReactionRemoved,
  applyReactionUpsert,
  applyUpdateMessageId,
  insertMessage,
  updateMessageFilePath,
  updateMessageStatus
} from '../message-cache.utils'

export function MessageProvider({ children }: React.PropsWithChildren) {
  const { data: account } = useCurrentAccount()

  // Gom tất cả handler vào một object (memoized)
  const handlers = React.useMemo(() => {
    if (!account) return null

    const messageService = container.messageService
    // Helper decrypt an toàn
    const safeDecrypt = async (payload: any): Promise<Message | null> => {
      try {
        console.log('[safeDecrypt] 1', { account, payload })
        return await messageService.decryptMessageForP2p(account, payload)
      } catch (err) {
        console.error('[MessageProvider] Decrypt failed:', err)
        return null
      }
    }

    const safeGroupDecrypt = async (payload: {
      messageId: string
      groupAddress: string
      encryptedContent: string
      type: ConversationType
    }): Promise<Message | null> => {
      try {
        const rs = await messageService.decryptMessageFromGroup(account, payload)
        return rs
      } catch (err) {
        console.error('[MessageProvider] Decrypt group failed:', err)
        return null
      }
    }

    return {
      // ── Message ────────────────────────────────────────────────
      'message.create': (e: AppEvents['message.create']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(e.message.accountId, e.message.conversationId),
          (old) => insertMessage(old, e.message)
        )
      },

      'message.status': (e: AppEvents['message.status']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(e.accountId, e.conversationId),
          (old) =>
            updateMessageStatus(old, {
              messageId: e.messageId,
              clientId: e.clientId,
              status: e.status
            })
        )
      },

      'message.sent': (e: AppEvents['message.sent']) => {
        console.log('message.sent', e)
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(e.accountId, e.conversationId),
          (old) =>
            applyMessageSent(old, {
              clientId: e.clientId,
              messageId: e.messageId,
              fileId: e.fileId
            })
        )
      },

      'message.update': (e: AppEvents['message.update']) => {
        console.log('message.update', e)
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(e.accountId, e.conversationId),
          (old) =>
            applyMessageUpdate(old, {
              messageId: e.messageId,
              message: e.message
            })
        )
      },

      'message.received': async (e: AppEvents['message.received']) => {
        const message = await safeDecrypt(e)

        if (!message) return
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, message.conversationId),
          (old) => {
            return insertMessage(old, message)
          }
        )
      },

      'message.partneredited': async (e: AppEvents['message.partneredited']) => {
        const message = await safeDecrypt({
          encryptedContent: e.newContent,
          sender: e.sender,
          recipient: e.recipient,
          messageId: e.messageId
        })
        if (!message) return

        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(message.accountId, message.conversationId),
          (old) =>
            applyMessageUpdate(old, {
              messageId: e.messageId,
              message: { ...message, id: e.messageId, isEdited: true }
            })
        )
        queryClient.invalidateQueries({
          queryKey: MESSAGE_QUERY_KEY.MESSAGES(account.address, message.conversationId)
        })
      },

      'message.editGroup': async (e: AppEvents['message.editGroup']) => {
        const message = await safeGroupDecrypt({
          encryptedContent: e.newContent,
          groupAddress: e.groupAddress,
          messageId: e.messageId,
          type: e.type
        })
        if (!message) return
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(message.accountId, message.conversationId),
          (old) => {
            //@ts-ignore
            delete message.sender
            return applyMessageUpdate(old, {
              messageId: e.messageId,
              message: { ...message, id: e.messageId, isEdited: true }
            })
          }
        )
        queryClient.invalidateQueries({
          queryKey: MESSAGE_QUERY_KEY.MESSAGES(account.address, message.conversationId)
        })
      },

      'message.updateGroup': async (e: AppEvents['message.updateGroup']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(e.message.accountId, e.message.conversationId),
          (old) => {
            return applyMessageUpdate(old, {
              messageId: e.messageId,
              message: { ...e.message, id: e.messageId, isEdited: true }
            })
          }
        )
      },

      'message.partnerdeleted': (e: AppEvents['message.partnerdeleted']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.sender),
          (old) => applyMessageDelete(old, { messageId: e.messageId })
        )
      },

      'message.deleteGroup': (e: AppEvents['message.deleteGroup']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, formatAddress(e.groupAddress)),
          (old) => applyMessageDelete(old, { messageId: e.messageId })
        )
      },

      'message.delete': (e: AppEvents['message.delete']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.conversationId),
          (old) => applyMessageDelete(old, { messageId: e.messageId, clientId: e.clientId })
        )
      },

      // ── Reaction ───────────────────────────────────────────────

      // 'reaction.group': (e: AppEvents['reaction.group']) => {
      //   queryClient.setQueryData<InfiniteData<Message[]>>(
      //     MESSAGE_QUERY_KEY.MESSAGES(formatAddress(account.address), formatAddress(e.reactor)),
      //     (old) => {
      //       const reactedByMe = e.reactor === account.contractAddress

      //       return applyReactionReceived(old, {
      //         messageId: e.messageId,
      //         encodedEmoji: e.reaction,
      //         reactedByMe,
      //         reactor: e.reactor
      //       })
      //     }
      //   )
      // },

      'file.cached': (e: AppEvents['file.cached']) => {
        // Iterate over all active message queries and update corresponding file paths
        const activeQueries = queryClient.getQueryCache().findAll({
          queryKey: ['messages']
        })
        console.log('activeQueries', activeQueries)
        activeQueries.forEach((query) => {
          const queryKey = query.queryKey as [string, string, string] // ['messages', accountId, conversationId]
          if (queryKey[0] !== 'messages') return
          console.log('queryKey', queryKey)
          queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (old) =>
            updateMessageFilePath(old, {
              fileKey: e.fileKey,
              filePath: e.filePath
            })
          )
        })
      },

      'reaction.removed': (e: AppEvents['reaction.removed']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(e.accountId, e.conversationId),
          (old) =>
            applyReactionRemoved(old, {
              messageId: e.messageId,
              conversationId: e.conversationId,
              reactor: e.reactor
            })
        )
      },

      'reaction.upsert': (e: AppEvents['reaction.upsert']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(e.accountId, e.conversationId),
          (old) =>
            applyReactionUpsert(old, {
              messageId: e.messageId,
              reactor: formatAddress(e.reactor),
              emoji: e.emoji,
              isMine: e.isMine
            })
        )
      },

      'message.add': (e: AppEvents['message.add']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.conversationId),
          (old) => {
            console.log('[MESSAGE_QUERY_KEY.MESSAGES]', {
              old,
              msg: e.message,
              e
            })
            return insertMessage(old, e.message)
          }
        )
      },

      'message.updateId': (e: AppEvents['message.updateId']) => {
        console.log('[message.updateId] 1', { e })
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.conversationId),
          (old) => {
            return applyUpdateMessageId(old, e.messageId, e.clientId, e.fileId)
          }
        )
      },

      'message.read': (e: AppEvents['message.read']) => {
        queryClient.setQueryData<{ pageParams: number; pages: Message[][] }>(
          MESSAGE_QUERY_KEY.MESSAGES(e.accountId, e.conversationId),
          (oldData) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((item) => {
                  return e.ids.includes(item.id ?? '') ? { ...item, status: 'read' } : item
                })
              )
            }
          }
        )
      },

      'message.receive.bua': (e: AppEvents['message.receive.bua']) => {
        container.eventBus.emit('message.add', e)
      }
    }
  }, [account]) // Chỉ depend vào account

  // Effect đăng ký / hủy đăng ký event
  React.useEffect(() => {
    if (!account || !handlers) return

    const eventBus = container.eventBus

    // Đăng ký từng cái – TypeScript sẽ infer đúng type cho từng handler
    eventBus.on('message.create', handlers['message.create'])
    eventBus.on('message.status', handlers['message.status'])
    eventBus.on('message.sent', handlers['message.sent'])
    eventBus.on('message.update', handlers['message.update'])
    eventBus.on('message.received', handlers['message.received'])
    eventBus.on('message.partneredited', handlers['message.partneredited'])
    eventBus.on('message.partnerdeleted', handlers['message.partnerdeleted'])
    eventBus.on('message.delete', handlers['message.delete'])
    eventBus.on('file.cached', handlers['file.cached'])
    eventBus.on('message.editGroup', handlers['message.editGroup'])
    eventBus.on('message.deleteGroup', handlers['message.deleteGroup'])
    eventBus.on('message.updateGroup', handlers['message.updateGroup'])
    eventBus.on('reaction.removed', handlers['reaction.removed'])
    eventBus.on('reaction.upsert', handlers['reaction.upsert'])
    eventBus.on('message.updateId', handlers['message.updateId'])
    eventBus.on('message.add', handlers['message.add'])
    eventBus.on('message.read', handlers['message.read'])
    eventBus.on('message.receive.bua', handlers['message.receive.bua'])

    return () => {
      eventBus.off('message.create', handlers['message.create'])
      eventBus.off('message.status', handlers['message.status'])
      eventBus.off('message.sent', handlers['message.sent'])
      eventBus.off('message.update', handlers['message.update'])
      eventBus.off('message.received', handlers['message.received'])
      eventBus.off('message.partneredited', handlers['message.partneredited'])
      eventBus.off('message.partnerdeleted', handlers['message.partnerdeleted'])
      eventBus.off('message.delete', handlers['message.delete'])
      eventBus.off('file.cached', handlers['file.cached'])
      eventBus.off('message.editGroup', handlers['message.editGroup'])
      eventBus.off('message.deleteGroup', handlers['message.deleteGroup'])
      eventBus.off('message.updateGroup', handlers['message.updateGroup'])
      eventBus.off('reaction.removed', handlers['reaction.removed'])
      eventBus.off('reaction.upsert', handlers['reaction.upsert'])
      eventBus.off('message.updateId', handlers['message.updateId'])
      eventBus.off('message.add', handlers['message.add'])
      eventBus.off('message.read', handlers['message.read'])
      eventBus.off('message.receive.bua', handlers['message.receive.bua'])
    }
  }, [account, handlers])

  return <>{children}</>
}
