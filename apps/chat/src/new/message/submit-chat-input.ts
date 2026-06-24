import { useMessageAction } from '@/features/message'
import { useCurrentState } from '@/hooks/use-current-state'
import { ACTIONS_QUERY_KEY } from '@/shared/lib/react-query'
import { fileActions } from '@/stores/file.store'
import { resetValue, useInputStore } from '@/stores/input.store'
import { useMutation } from '@tanstack/react-query'
import { uploadFile, useSelectedId } from 'file-core'
import { setConveration } from '../conversation'
import { useEditMessage } from './edit-message'
import { handleSendMessage } from './send-message-v4'

export function useSubmitChatInput() {
  const { messageAction, setMessageAction } = useMessageAction()
  const { base, account } = useCurrentState()
  const edit = useEditMessage()
  const fileIds = useSelectedId()

  function getComposer() {
    const isReply = messageAction?.type === 'REPLY'
    return {
      isReply,
      composer: isReply
        ? {
            replyTo: messageAction.messageId
          }
        : {}
    }
  }

  const mutation = useMutation({
    mutationKey: ACTIONS_QUERY_KEY.sendMessage,
    mutationFn: async () => {
      if (!account) return
      console.log('thanhduy - submit chat input 1')
      const value = useInputStore.getState().chatValue

      if (!value && !fileIds.length) return
      resetValue('chatValue')

      if (messageAction?.type === 'EDIT') {
        setMessageAction(null)

        return edit.mutate({
          messageId: messageAction!.messageId,
          newContent: value
        })
      }
      const type = !fileIds.length ? 'text' : 'file'
      fileActions.reset()
      const { isReply, composer } = getComposer()
      if (isReply) setMessageAction(null)
      console.log('thanhduy - submit chat input 2')

      let files
      console.log('fileIds 1', fileIds)
      const { promise } = uploadFile(fileIds, account?.address)
      if (!!fileIds.length) {
        files = {
          ids: fileIds,
          readlIds: promise
        }
      }
      console.log('fileIds 2', files)

      const messageId = await handleSendMessage(
        {
          type,
          content: value,
          ...composer
        },
        base,
        files
      )

      if (messageId) setConveration(base.id, { lastMessageId: messageId })
    }
  })

  return {
    ...mutation,
    submit: () => mutation.mutate()
  }
}
