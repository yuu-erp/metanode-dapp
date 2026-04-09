import { useCallback } from 'react'
import { blockchain } from '~/clients'
import { roomStore, userActions, useRoomStore, userStore, useUserStore } from '~/stores'

export function useRaiseHand() {
  const address = useRoomStore((s) => s.address)
  const isRaise = useUserStore((s) => s.raiseHandUsers.includes(address))

  const raiseHand = useCallback(async () => {
    const { address, roomId } = roomStore.getState()
    const { raiseHandUsers } = userStore.getState()
    const isRaising = raiseHandUsers.includes(address)

    const value = !isRaising

    userActions.toggleRaiseHandUser(address, value)
    await blockchain.handleRaiseHand({
      _isRaiseHand: value,
      owner: address,
      roomId
    })
  }, [])

  return { isRaise, raiseHand }
}
