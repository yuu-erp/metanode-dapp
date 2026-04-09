import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getCallback } from '~/clients'
import { fetchRoomId } from '~/services'
import { joinRoom } from '~/services/private/room/joinRoom'

export function useAutoJoinRoom(enabled: boolean) {
  const onFetchRoomId = useMutation({ mutationFn: fetchRoomId })
  const onJoinRoom = useMutation({ mutationFn: joinRoom })

  useEffect(() => {
    console.log('thanhduy - useAutoJoinRoom 1')
    if (!enabled) return
    console.log('thanhduy - useAutoJoinRoom 2')

    const handleFetchAndJoinRoom = async () => {
      console.log('thanhduy - useAutoJoinRoom 3')

      const roomId = await onFetchRoomId.mutateAsync()
      console.log('thanhduy - useAutoJoinRoom 4')

      getCallback('onRoomIdFetched')(roomId)
      await onJoinRoom.mutateAsync()
      console.log('thanhduy - useAutoJoinRoom 5')
    }
    handleFetchAndJoinRoom()
  }, [enabled])
}
