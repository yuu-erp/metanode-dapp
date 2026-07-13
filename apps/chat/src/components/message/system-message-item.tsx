import { useName } from '@/new/user/user-info'
import { memo } from 'react'
import type { WithMessage } from './types'

export const SystemMessageItem = memo(({ data }: WithMessage) => {
  const { name } = useName(data.sender)

  return (
    <div className="my-2 px-4 py-1.5 mx-auto text-xs w-fit rounded-full bg-black/30 text-white">{`${name} has left group`}</div>
  )
})
