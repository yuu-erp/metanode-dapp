import { useMessageAction } from '@/features/message'
import { useCurrentState } from '@/hooks/use-current-state'
import { fileActions, useFileStore } from '@/stores/file.store'
import { resetValue, useInputStore } from '@/stores/input.store'
import { useEditMessage } from './edit-message'
import { processFile, useSendMessage } from './send-message-v4'

export function useSubmitChatInput() {
  const mutation = useSendMessage()
  const { messageAction, setMessageAction } = useMessageAction()
  const { base } = useCurrentState()
  const edit = useEditMessage()

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

  return {
    ...mutation,
    submit: async () => {
      const value = useInputStore.getState().chatValue
      if (!value) return
      resetValue('chatValue')

      if (messageAction?.type === 'EDIT') {
        setMessageAction(null)

        return edit.mutate({
          messageId: messageAction!.messageId,
          newContent: value
        })
      }

      const fileItems = useFileStore.getState().items
      const type = !fileItems.length ? 'text' : 'file'
      fileActions.reset()
      const { isReply, composer } = getComposer()
      if (isReply) setMessageAction(null)
      await mutation.mutateAsync({
        input: {
          type,
          content: value,
          ...composer
        },
        base,
        transformInput: processFile(fileItems)
      })
    }
  }
}
