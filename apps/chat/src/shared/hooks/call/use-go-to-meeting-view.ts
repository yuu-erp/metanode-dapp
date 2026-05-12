import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
import { handleMessageError } from '@/shared/utils/errorNative'
import { sendCommand } from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export function useGoToMeetingView() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: MeetingViewInput) => {
      const query = new URLSearchParams(input as any).toString()
      console.log('[DEBUG] useGoToMeetingView 1', query)
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
}
