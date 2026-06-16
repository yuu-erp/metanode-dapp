import { useMessageAction } from '@/features/message'
import { useCurrentState } from '@/hooks/use-current-state'
import { fileActions, useFileStore } from '@/stores/file.store'
import { resetValue, useInputStore } from '@/stores/input.store'
import { useEditMessage } from './edit-message'
import { processFileV2, useSendMessage } from './send-message-v4'

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
      console.log('thanhduy - submit chat input 1')
      const value = useInputStore.getState().chatValue
      const fileItems = useFileStore.getState().items

      if (!value && !fileItems.length) return
      resetValue('chatValue')

      if (messageAction?.type === 'EDIT') {
        setMessageAction(null)

        return edit.mutate({
          messageId: messageAction!.messageId,
          newContent: value
        })
      }
      const type = !fileItems.length ? 'text' : 'file'
      fileActions.reset()
      const { isReply, composer } = getComposer()
      if (isReply) setMessageAction(null)
      console.log('thanhduy - submit chat input 2')

      await mutation.mutateAsync({
        input: {
          type,
          content: value,
          ...composer
        },
        base,
        transformInput: processFileV2(fileItems)
      })
    }
  }
}
