import { useGetGroupMembers } from '@/features/conversation'
import { useCurrentAccount, useCurrentConversationType } from '@/shared/hooks'
import { useParams } from '@tanstack/react-router'
import { memo } from 'react'

export type GroupMembersProps = {}

export const GroupMembers = memo(({}: GroupMembersProps) => {
  const { id } = useParams({ from: '/_authenticated/$type/$id' })
  const type = useCurrentConversationType()
  const { data: account } = useCurrentAccount()

  const { data } = useGetGroupMembers(account?.address, id, type)
  const count = data?.length ?? 0

  if (!count) return
  return <p>{`${data?.length} Member${count > 1 ? 's' : ''}`}</p>
})
