import { container } from '@/container'
import { callActions, callStore } from '@/modules/call'
import { endCall } from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

export function useEndCall() {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const { callee, isMeet, caller, isCaller, roomId, sessionId, hiddenAddress } =
        callStore.getState()
      const conversationId = isMeet ? callee : isCaller ? callee : caller
      callActions.cleanup()
      await container.meetingContract.leaveRoom({
        from: hiddenAddress,
        inputData: {
          end: false,
          otherParty: conversationId,
          sender: hiddenAddress,
          roomId,
          sessionId,
          meet: isMeet
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
