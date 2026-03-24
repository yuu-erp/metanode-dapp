import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
import { sendCommand } from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useGoToMeetingView() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: MeetingViewInput & any) => {
      //@ts-ignore
      if (window?.finSdk) {
        // navigate({ to: '/meeting', search: input })
        //@ts-ignore
        // const port = input?.new ? '5174' : '5173'
        const query = new URLSearchParams(input as any).toString()
        // window.location.href = `http://localhost:${port}/#/?${query}`
        // window.location.href = `https://call.fi.ai/#/?${query}`
        navigate({ to: '/call', search: input })
      } else {
        await Promise.race([
          sendCommand('startCallRTC', {
            //@ts-ignore
            query: new URLSearchParams(input).toString()
            // url: 'http://192.168.1.180:5173/'
          }),
          new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 2000)
          })
        ])
      }
    }
  })
}
