import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getCallback } from '~/clients'
import { fetchRoomId } from '~/services'
import { joinRoom } from '~/services/private/room/joinRoom'

export function useAutoJoinRoom(enabled: boolean) {
  const onFetchRoomId = useMutation({ mutationFn: fetchRoomId })
  const onJoinRoom = useMutation({ mutationFn: joinRoom })
  console.log('[useAutoJoinRoom] enabled', enabled)
  useEffect(() => {
    if (!enabled) return

    const handleFetchAndJoinRoom = async () => {
      const roomId = await onFetchRoomId.mutateAsync()

      getCallback('onRoomIdFetched')(roomId)
      await onJoinRoom.mutateAsync()
    }
    handleFetchAndJoinRoom()
  }, [enabled])
}
