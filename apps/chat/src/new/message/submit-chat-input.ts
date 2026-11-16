import { useMessageAction } from '@/features/message'
import { useCurrentState } from '@/hooks/use-current-state'
import { ACTIONS_QUERY_KEY } from '@/shared/lib/react-query'
import { fileActions, useFileStore } from '@/stores/file.store'
import { resetValue, useInputStore } from '@/stores/input.store'
import { useMutation } from '@tanstack/react-query'
import { setConveration } from '../conversation'
import { useEditMessage } from './edit-message'
import { handleSendMessage } from './send-message-v4'
import { prepareFilesForSend } from './upload-files-for-send'

export function useSubmitChatInput() {
  const { messageAction, setMessageAction } = useMessageAction()
  const { base: _base, account } = useCurrentState()
  const edit = useEditMessage()
  const fileItems = useFileStore((s) => s.items)

  function getComposer() {
    const isReply = messageAction?.type === 'REPLY'
    return {
      isReply,
      composer: isReply
        ? {
            replyTo: messageAction.messageId,
          }
        : {},
    }
  }

  const mutation = useMutation({
    mutationKey: ACTIONS_QUERY_KEY.sendMessage,
    mutationFn: async (input: { value?: string; base?: BaseConversation }) => {
      if (!account) return
      let { value, base } = input ?? {}
      if (!value) {
        value = useInputStore.getState().chatValue
      }
      if (!base) {
        base = _base
      }

      if (!value?.trim() && fileItems.length === 0) return
      resetValue('chatValue')

      if (messageAction?.type === 'EDIT') {
        setMessageAction(null)

        return edit.mutate({
          messageId: messageAction!.messageId,
          newContent: value,
        })
      }
      const hasFiles = fileItems.length > 0
      const type = hasFiles ? 'file' : 'text'
      const itemsSnapshot = [...fileItems]
      const { isReply, composer } = getComposer()
      if (isReply) setMessageAction(null)

      const files = hasFiles ? prepareFilesForSend(itemsSnapshot) : undefined
      if (hasFiles) {
        fileActions.reset()
      }

      const messageId = await handleSendMessage(
        {
          type,
          content: value,
          ...(hasFiles ? { fileIds: files!.ids } : {}),
          ...composer,
        },
        base,
        files,
      )

      if (messageId) setConveration(base.id, { lastMessageId: messageId })
    },
  })

  return {
    ...mutation,
    submit: mutation.mutate as any,
  }
}
