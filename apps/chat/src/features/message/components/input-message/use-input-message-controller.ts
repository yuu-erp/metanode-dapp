'use client'

import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message, MessageAction } from '@/modules/message'
import * as React from 'react'
import { useSendFile } from '../../hooks'
import { useAttachmentPicker } from './use-attachment-picker'
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
  const [files, setFiles] = React.useState<File[]>([])
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = React.useState(false)
  const [fileData, setFileData] = React.useState<any[]>([])

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

  const attachment = useAttachmentPicker({
    onSelect: (newFiles) => {
      setFiles((prev) => {
        // const totalSize = [...prev, ...newFiles].reduce((acc, file) => acc + file.size, 0)
        // // if (totalSize > 10 * 1024 * 1024) {
        // //   toast.error('Total file size must not exceed 10MB')
        // //   return prev
        // // }
        return [...prev, ...newFiles]
      })
    }
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

  const onRemoveFileData = React.useCallback((index: number) => {
    setFileData((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSendFile = React.useCallback(() => {
    if (!account || !conversation || (!files.length && !fileData.length)) return
    const _files = fileData.length ? fileData : files
    sendFile({ account, conversation, files: _files })
    setFiles([])
    setFileData([])
  }, [account, conversation, files, sendFile, fileData])

  const handleSend = React.useCallback(() => {
    if (files.length > 0 || fileData.length > 0) {
      handleSendFile()
    }
    if (composer.message.trim()) {
      composer.sendText()
    }
  }, [files.length, handleSendFile, composer.message, composer.sendText, fileData.length])

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
    setIsStickerDrawerOpen,
    setFiles,
    setFileData,
    fileData,
    onRemoveFileData
  }
}
