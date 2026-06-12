// 'use client'

// import * as React from 'react'
// import { useCopyMessageAction, useMessageAction } from '../../contexts'
// import { useDeleteMessage, useReactToMessage, useUnreactToMessage } from '../../hooks'
// import OverlayMessageView from './overlay-message-view'
// import type { OverlayMessageHandlers, OverlayMessageProps } from './overlay-message.types'

// import { container } from '@/container'
// import { useCurrentState } from '@/hooks/use-current-state'
// import { asyncPriorityQueue } from '@/modules/realtime'
// import { pinMessage, setPinnedMessageState, useIsPinned } from '@/new/message'
// import { useIsMineReaction } from '@/shared/hooks'
// import { useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner'

// function OverlayMessage({ onClose, message, conversation, account }: OverlayMessageProps) {
//   const { setMessageAction } = useMessageAction()
//   const { copyMessage } = useCopyMessageAction()
//   const { mutateAsync: mutateReactToMessage } = useReactToMessage()
//   const { mutateAsync: mutateUnreactToMessage } = useUnreactToMessage()
//   const { mutate: mutateDelete } = useDeleteMessage()
//   const { base } = useCurrentState()

//   const { isPinned } = useIsPinned(message.id)
//   const queryClient = useQueryClient()
//   const isMine = useIsMineReaction()

//   const handleClose = React.useCallback(() => onClose(), [onClose])

//   const handlers: OverlayMessageHandlers = React.useMemo(
//     () => ({
//       onReact: (emoji: string) => {
//         if (!message?.id) return
//         if (!account || !conversation) return

//         const currentReaction = (message.reactions ?? []).find(isMine)

//         const shouldUnReact = currentReaction?.emoji === emoji

//         asyncPriorityQueue.add(async () => {
//           if (shouldUnReact) {
//             await mutateUnreactToMessage({
//               account,
//               conversation,
//               messageId: message.id
//             })
//           } else {
//             await mutateReactToMessage({
//               account,
//               conversation,
//               payload: {
//                 messageId: message.id,
//                 emoji
//               }
//             })
//           }
//         }, 'high')

//         handleClose()
//       },

//       onReply: () => {
//         setMessageAction({
//           type: 'REPLY',
//           message
//         })
//         handleClose()
//       },

//       onCopy: () => {
//         copyMessage(message.type === 'text' ? message.content : '')
//         handleClose()
//       },

//       onForward: () => {
//         setMessageAction({
//           type: 'FORWARD',
//           message
//         })
//         handleClose()
//       },

//       onDelete: () => {
//         if (!message?.id) return
//         if (!account || !conversation) return
//         mutateDelete(message)
//         handleClose()
//       },

//       onEdit: () => {
//         setMessageAction({
//           type: 'EDIT',
//           message
//         })
//         handleClose()
//       },

//       onSave: () => {
//         if ((message.type !== 'file' && message.type !== 'voice') || !message.fileId) return
//         // const mimeType = message.mimeType || 'application/octet-stream'
//         container.eventBus.emit('file.download', {
//           message: message,
//           saveByWeb: !!window.fiaiSDK
//         })

//         handleClose()
//       },

//       onPin: async () => {
//         if (!account || !conversation || !message.id) return
//         try {
//           if (isPinned) {
//             setPinnedMessageState(base, message.id, false)
//             pinMessage(false, message.id, base)
//             // toast.success('Đã bỏ ghim tin nhắn')
//           } else {
//             setPinnedMessageState(base, message.id, true)
//             pinMessage(true, message.id, base)
//             // toast.success('Đã ghim tin nhắn')
//           }
//           await Promise.all([
//             queryClient.invalidateQueries({
//               queryKey: [
//                 'message-pin-status',
//                 account.address,
//                 conversation.conversationId,
//                 message.id
//               ]
//             }),
//             queryClient.invalidateQueries({
//               queryKey: ['pinned-messages', account.address, conversation.conversationId]
//             })
//           ])
//           // setIsPinned(!isPinned) // Optimistic update not needed with invalidateQueries
//           handleClose()
//         } catch (error) {
//           console.error('Failed to toggle pin', error)
//           toast.error('Có lỗi xảy ra')
//         }
//       }
//     }),
//     [
//       isPinned,
//       account,
//       conversation,
//       message,
//       mutateReactToMessage,
//       mutateDelete,
//       setMessageAction,
//       copyMessage,
//       handleClose,
//       queryClient,
//       isMine
//     ]
//   )

//   return (
//     <OverlayMessageView
//       message={message}
//       handlers={handlers}
//       isPinned={isPinned || false}
//       onClose={handleClose}
//     />
//   )
// }

// export default React.memo(OverlayMessage)
