'use client'
import { container } from '@/container'
import type { Message } from '@/modules/message'
import { useCurrentAccount } from '@/shared/hooks'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import type { AppEvents } from '@/types/app-events'
import type { InfiniteData } from '@tanstack/react-query'
import * as React from 'react'
import {
  applyMessageDelete,
  applyMessageSent,
  applyMessageUpdate,
  applyReactionCreate,
  applyReactionReceived,
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
        return await messageService.decryptMessageFromPartner(account, payload)
      } catch (err) {
        console.error('[MessageProvider] Decrypt failed:', err)
        return null
      }
    }

    const safeGroupDecrypt = async (payload: {
      messageId: string
      groupAddress: string
      encryptedContent: string
    }): Promise<Message | null> => {
      try {
        return await messageService.decryptMessageFromGroup(account, payload)
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
          (old) => insertMessage(old, message)
        )
      },

      'message.sentGroup': async (e: AppEvents['message.sentGroup']) => {
        const message = await safeGroupDecrypt(e)
        if (!message) return

        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, message.conversationId),
          (old) => insertMessage(old, message)
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

      'message.partnerdeleted': (e: AppEvents['message.partnerdeleted']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.sender),
          (old) => applyMessageDelete(old, { messageId: e.messageId })
        )
      },

      'message.deleteGroup': (e: AppEvents['message.deleteGroup']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.groupAddress),
          (old) => applyMessageDelete(old, { messageId: e.messageId })
        )
      },

      'message.delete': (e: AppEvents['message.delete']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.conversationId),
          (old) => applyMessageDelete(old, { messageId: e.messageId })
        )
      },

      // ── Reaction ───────────────────────────────────────────────
      'reaction.received': (e: AppEvents['reaction.received']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.sender),
          (old) =>
            applyReactionReceived(old, {
              messageId: e.messageId,
              encodedEmoji: e.reaction,
              reactedByMe: e.reactor === account.contractAddress
            })
        )
      },
      'reaction.group': (e: AppEvents['reaction.group']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(account.address, e.reactor),
          (old) =>
            applyReactionReceived(old, {
              messageId: e.messageId,
              encodedEmoji: e.reaction,
              reactedByMe: e.reactor === account.contractAddress
            })
        )
      },

      'reaction.create': (e: AppEvents['reaction.create']) => {
        queryClient.setQueryData<InfiniteData<Message[]>>(
          MESSAGE_QUERY_KEY.MESSAGES(e.accountId, e.conversationId),
          (old) =>
            applyReactionCreate(old, {
              messageId: e.messageId,
              emoji: e.emoji
            })
        )
      },
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
    eventBus.on('reaction.received', handlers['reaction.received'])
    eventBus.on('reaction.create', handlers['reaction.create'])
    eventBus.on('file.cached', handlers['file.cached'])
    return () => {
      eventBus.off('message.create', handlers['message.create'])
      eventBus.off('message.status', handlers['message.status'])
      eventBus.off('message.sent', handlers['message.sent'])
      eventBus.off('message.update', handlers['message.update'])
      eventBus.off('message.received', handlers['message.received'])
      eventBus.off('message.partneredited', handlers['message.partneredited'])
      eventBus.off('message.partnerdeleted', handlers['message.partnerdeleted'])
      eventBus.off('message.delete', handlers['message.delete'])
      eventBus.off('reaction.received', handlers['reaction.received'])
      eventBus.off('reaction.create', handlers['reaction.create'])
      eventBus.off('file.cached', handlers['file.cached'])
    }
  }, [account, handlers])

  return <>{children}</>
}
