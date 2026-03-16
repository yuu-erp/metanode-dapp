import { container } from '@/modules/container'
import { asyncPriorityQueue } from '@/modules/realtime'
import { formatAddress, queryKeys, useViewInput } from '@/shared'
import { useQuery } from '@tanstack/react-query'
import { callCtx } from '@/modules/call/call.ctx'

export function useSetupCall() {
  const { data: input, setViewInput } = useViewInput()

  return useQuery({
    queryKey: queryKeys.setupCall,
    enabled: !!input,
    queryFn: async () => {
      try {
        console.log('thanhduy - useSetupCall 1', input)
        callCtx.pushLog('setup_call_start')

        if (!input) return false
        console.log('thanhduy - useSetupCall 2')

        let roomId = input.roomId ?? ''
        if (input.isCaller) {
          callCtx.pushLog('setup_call_create_room_start')
          console.log('thanhduy - useSetupCall 3')

          const rs = await asyncPriorityQueue.add(async () => {
            try {
              return await container.callService.createRoom(input)
            } catch (error) {
              console.log('create room error', error)
              throw error
            }
          })
          console.log('thanhduy - useSetupCall 4')

          roomId = rs.roomId
          callCtx.pushLog('setup_call_create_room_done', { roomId })
          setViewInput({ roomId })
        }
        roomId = formatAddress(roomId)
        console.log('thanhduy - useSetupCall 5')

        if (
          callCtx.joinState === 'joined' &&
          callCtx.activeRoomId === roomId &&
          callCtx.activeSessionId &&
          callCtx.isConnectionHealthy()
        ) {
          setViewInput({ roomId, sessionId: callCtx.activeSessionId })
          return true
        }

        const { sessionId } = await asyncPriorityQueue.add(async () => {
          try {
            callCtx.pushLog('setup_call_join_room_start', { roomId })
            return await container.callService.joinRoom(input, roomId)
          } catch (error) {
            console.log('joinRoom error: ', error)
            throw error
          }
        })
        console.log('thanhduy - useSetupCall 6')

        setViewInput({ sessionId })
        callCtx.pushLog('setup_call_join_room_done', { sessionId })

        return true
      } catch (error) {
        callCtx.pushLog('setup_call_error', {
          message: error instanceof Error ? error.message : String(error)
        })
        console.log('thanhduy - useSetupCall error: ', error)
        throw error
      }
    },
    retry: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false
  })
}
