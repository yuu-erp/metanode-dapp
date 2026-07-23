import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
import { handleMessageError } from '@/shared/utils/errorNative'
import { sendCommand } from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getState, setState } from 'call-core'
import { toast } from 'sonner'
import { useConversationParams } from '../use-conversation-params'
import { useCurrentAccount } from '../use-current-account'
import { useGetConversationId } from '../use-get-conversation-id'

export function useGoToMeetingView() {
  const navigate = useNavigate()
  const { id, type } = useConversationParams()
  const { data: conversation } = useGetConversationId(id, type)
  const { data: account } = useCurrentAccount()

  const mutatation = useMutation({
    mutationFn: async (input: MeetingViewInput) => {
      input = { ...input, hiddenAddress: account?.hiddenAddress } as any
      const query = new URLSearchParams(input as any).toString()
      console.log('[DEBUG] useGoToMeetingView 1', { query, input, id, type })
      await setState({ metadata: { id, type } })
      console.log('thanhduy test huhu', await getState())
      if (window?.fiaiSDK) {
        // navigate({ to: '/meeting', search: input })
        //@ts-ignore
        // const port = input?.new ? '5174' : '5173'
        // window.location.href = `http://localhost:${port}/#/?${query}`
        // window.location.href = `https://call.fi.ai/#/?${query}`
        navigate({ to: '/call', search: input })
      } else {
        const payload: any = {
          query
        }
        if (import.meta.env.DEV) {
          payload.url = 'http://192.168.1.2:5174/'
        }

        console.log('start call rtc 1', performance.now())
        await sendCommand('startCallRTC', payload)
        console.log('start call rtc 2', performance.now())

        // await Promise.race([
        //   ,
        //   new Promise<void>((resolve) => {
        //     setTimeout(() => resolve(), 2000)
        //   })
        // ])
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
      isMeet: type === 'p2p' ? false : true,
      conversationType: conversation.conversationType
    })
  }

  return { ...mutatation, onVideoCall }
}
