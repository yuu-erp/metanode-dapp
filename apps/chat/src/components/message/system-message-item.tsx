import { memo, useEffect } from 'react'
import type { WithMessage } from './types'
import { useName } from '@/new/user/user-info'
import { useAdmin } from '@/shared/hooks/group/use-admin'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useCurrentState } from '@/hooks/use-current-state'

export const SystemMessageItem = memo(({ data }: WithMessage) => {
  const { name } = useName(data.sender)
  const { isAdmin } = useAdmin()
  const { base } = useCurrentState()

  useEffect(() => {
    if (data.kind === 'leave_group' && isAdmin) {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEY.GROUP_MEMBERS(base.id) })
    }
  }, [])

  return (
    <div className="my-2 px-4 py-1.5 mx-auto text-xs w-fit rounded-full bg-black/30">{`${name} has left group`}</div>
  )
})
