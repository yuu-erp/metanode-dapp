import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
import { handleMessageError } from '@/shared/utils/errorNative'
import { sendCommand } from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useConversationParams } from '../use-conversation-params'
import { useGetConversationId } from '../use-get-conversation-id'
import { useCurrentAccount } from '../use-current-account'
import { useStatusStore } from '@app/call'

export function useGoToMeetingView() {
  const navigate = useNavigate()
  const { id, type } = useConversationParams()
  const { data: conversation } = useGetConversationId(id, type)
  const { data: account } = useCurrentAccount()

  const mutatation = useMutation({
    mutationFn: async (input: MeetingViewInput) => {
      const query = new URLSearchParams(input as any).toString()
      console.log('[DEBUG] useGoToMeetingView 1', { query, input, id, type })
      useStatusStore.setState({ id, type })
      if (window?.finSdk) {
        // navigate({ to: '/meeting', search: input })
        //@ts-ignore
        // const port = input?.new ? '5174' : '5173'
        // window.location.href = `http://localhost:${port}/#/?${query}`
        // window.location.href = `https://call.fi.ai/#/?${query}`
        navigate({ to: '/call', search: input })
      } else {
        await Promise.race([
          sendCommand('startCallRTC', {
            query
            // url: 'http://192.168.1.180:5173/'
          }),
          new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 2000)
          })
        ])
      }
    },
    onError: (error) => toast.error(handleMessageError(error))
  })

  const onVideoCall = async () => {
    if (!account || !conversation) return

    mutatation.mutate({
      address: account.address,
      caller: account.address,
      callee: conversation.conversationId,
      isCaller: true,
      isMeet: true,
      conversationType: conversation.conversationType
    })
  }

  return { ...mutatation, onVideoCall }
}
