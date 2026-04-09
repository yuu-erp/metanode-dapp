import { container } from '@/container'
import { getUserByAddress } from '@/shared/hooks/conversations/use-user-by-address'
import { CALL_QUERY_KEY } from '@/shared/lib/react-query'
import { useRoomStore } from '@app/call'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { memo } from 'react'

const createUserFromParticipant = (hiddenAddress: string) =>
  queryOptions({
    queryKey: CALL_QUERY_KEY.USER(hiddenAddress),
    queryFn: async () => {
      const { roomId, address } = useRoomStore.getState()

      const owner = await container.meetingContract.getRoomParticipantOwner({
        from: hiddenAddress,
        inputData: { roomId: roomId }
      })

      return await getUserByAddress(address, owner)
    }
  })

export type CallMemberItemProps = {
  participant: string
}

export const CallMemberItem = memo(({ participant }: CallMemberItemProps) => {
  const { data } = useQuery(createUserFromParticipant(participant))

  return <div>{data?.name}</div>
})
