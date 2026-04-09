import { queryOptions } from '@tanstack/react-query'
import { blockchain } from '~/clients'
import { queryKeys } from '~/configs'
import { roomStore } from '~/stores'

export const createRoomMembersQuery = () =>
  queryOptions({
    queryKey: queryKeys.roomMembers(''),
    queryFn: async () => {
      const { roomId } = roomStore.getState()
      const members = await blockchain.getRoomParticipants({ roomId })
      return members
    }
  })
