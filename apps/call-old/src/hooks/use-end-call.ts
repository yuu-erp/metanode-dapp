import { blockchain, callContext } from '@/modules'
import { randomBytes32 } from '@/shared'
import { endCall } from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

export function useEndCall() {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const { address, callee, isMeet, caller, isCaller, roomId, sessionId } = callContext
      console.log('thanhduy - callContext', callContext)
      const conversationId = isMeet ? callee : isCaller ? callee : caller

      await blockchain.meeting.leaveRoom({
        from: address,
        inputData: {
          end: false,
          otherParty: conversationId,
          requestId: randomBytes32(),
          roomId,
          sessionId
        }
      })

      if (window.finSdk) {
        router.history.back()
      } else {
        endCall()
      }
    }
  })
}
