'use client'

import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message, MessageAction } from '@/modules/message'
import { fileActions, useFileStore } from '@/stores/file.store'
import * as React from 'react'
import { useSendFile } from '../../hooks'
import { useChatInputLayout } from './use-chat-input-layout'
import { useMessageComposer } from './use-message-composer'

interface UseInputMessageControllerParams {
  account?: Account
  conversation?: Conversation
  isSending?: boolean
  /** Tuỳ chọn; P2P không truyền → composer dùng passthrough, nội dung gửi = text đã nhập. */
  formatOutgoingText?: (displayText: string) => string
  onSendText: (content: string, messageAction: MessageAction | null) => void
  onSendSticker: (stickerId: string, messageAction: MessageAction | null) => void
  onEditMessage: (messageOld: Message, content: string) => void
}

export function useInputMessageController({
  account,
  conversation,
  isSending = false,
  formatOutgoingText,
  onSendText,
  onSendSticker,
  onEditMessage
}: UseInputMessageControllerParams) {
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = React.useState(false)
  const fileItems = useFileStore((s) => s.items)

  const composer = useMessageComposer({
    account,
    conversation,
    isSending,
    formatOutgoingText,
    onSendText,
    onSendSticker,
    onEditMessage
  })
  const layout = useChatInputLayout(composer.message)

  // Note: File sending is still decoupled here, but might needs to be passed in as well if Group file sending is different.
  // The user only mentioned send message logic, so I'll keep file sending here for now but useSendFile is strictly P2P?
  // Actually useSendFile seems generic, but if Group needs different file sending, we should inject it too.
  // For this task regarding useMessageComposer, I will only focus on the composer parts, but for consistency I should probably expose file sending too?
  // No, the task specifically asked about useMessageComposer refactor. I'll leave file sending as is for now unless I see useSendFile is P2P specific.
  // P2P useSendFile calls useSendMessage internally usually.
  const { mutate: sendFile, isPending: isSendingFile } = useSendFile('file')

  const handleSend = React.useCallback(() => {
    if (!!fileItems.length) {
      sendFile({ files: fileItems, content: composer.message.trim() })
      fileActions.reset()
      return
    }
    if (composer.message.trim()) {
      composer.sendText()
    }
  }, [composer.message, composer.sendText, fileItems])

  return {
    // State & Refs
    message: composer.message,
    isPending: composer.isPending || isSendingFile,
    messageAction: composer.messageAction,
    textareaRef: layout.textareaRef,
    containerRef: layout.containerRef,

    // Components

    // Handlers
    setMessage: composer.setMessage,
    handleSend,
    handleSendSticker: composer.sendSticker,
    clearAction: composer.clearAction,

    // UI state
    isStickerDrawerOpen,
    setIsStickerDrawerOpen
  }
}
