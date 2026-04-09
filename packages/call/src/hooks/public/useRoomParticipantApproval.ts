import { useCallback } from 'react'
import { blockchain } from '~/clients'
import { callActions, roomStore } from '~/stores'

export function useRoomParticipantApproval(user: string) {
  const admit = useCallback(async () => {
    const { roomId } = roomStore.getState()
    callActions.toggleRequester(user, false)
    await blockchain.approveParticipant({
      _participant: user,
      roomId
    })
  }, [user])

  const deny = useCallback(async () => {
    const { roomId } = roomStore.getState()
    callActions.toggleRequester(user, false)
    await blockchain.rejectParticipant({
      _participant: user,
      roomId
    })
  }, [user])

  return { admit, deny }
}
