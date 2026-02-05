'use client'

import * as React from 'react'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message, MessageAction } from '@/modules/message'
import { useSendFile } from '../../hooks'
import { useAttachmentPicker } from './use-attachment-picker'
import { useChatInputLayout } from './use-chat-input-layout'
import { useMessageComposer } from './use-message-composer'

interface UseInputMessageControllerParams {
  account?: Account
  conversation?: Conversation
  isSending?: boolean
  onSendText: (content: string, messageAction: MessageAction | null) => void
  onSendSticker: (stickerId: string, messageAction: MessageAction | null) => void
  onEditMessage: (messageOld: Message, content: string) => void
}

export function useInputMessageController({
  account,
  conversation,
  isSending = false,
  onSendText,
  onSendSticker,
  onEditMessage
}: UseInputMessageControllerParams) {
  const [files, setFiles] = React.useState<File[]>([])
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = React.useState(false)

  const composer = useMessageComposer({
    account,
    conversation,
    isSending,
    onSendText,
    onSendSticker,
    onEditMessage
  })
  const layout = useChatInputLayout(composer.message)

  const attachment = useAttachmentPicker({
    onSelect: (newFiles) => setFiles((prev) => [...prev, ...newFiles])
  })

  // Note: File sending is still decoupled here, but might needs to be passed in as well if Group file sending is different.
  // The user only mentioned send message logic, so I'll keep file sending here for now but useSendFile is strictly P2P?
  // Actually useSendFile seems generic, but if Group needs different file sending, we should inject it too.
  // For this task regarding useMessageComposer, I will only focus on the composer parts, but for consistency I should probably expose file sending too?
  // No, the task specifically asked about useMessageComposer refactor. I'll leave file sending as is for now unless I see useSendFile is P2P specific.
  // P2P useSendFile calls useSendMessage internally usually.
  const { mutate: sendFile, isPending: isSendingFile } = useSendFile()

  const handleRemoveFile = React.useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSendFile = React.useCallback(() => {
    if (!account || !conversation || !files.length) return
    sendFile({ account, conversation, files })
    setFiles([])
  }, [account, conversation, files, sendFile])

  const handleSend = React.useCallback(() => {
    if (files.length > 0) {
      handleSendFile()
    }
    if (composer.message.trim()) {
      composer.sendText()
    }
  }, [files.length, handleSendFile, composer.message, composer.sendText])

  return {
    // State & Refs
    message: composer.message,
    files,
    isPending: composer.isPending || isSendingFile,
    messageAction: composer.messageAction,
    textareaRef: layout.textareaRef,
    containerRef: layout.containerRef,

    // Components
    FileInput: attachment.FileInput,

    // Handlers
    setMessage: composer.setMessage,
    handleSend,
    handleSendSticker: composer.sendSticker,
    openFilePicker: attachment.openFilePicker,
    clearAction: composer.clearAction,
    handleRemoveFile,

    // UI state
    isStickerDrawerOpen,
    setIsStickerDrawerOpen
  }
}
