import { useName } from '@/new/user/user-info'
import { memo } from 'react'

export type NameOnMessageItemProps = {
  data: FulleMessage
}

export const NameOnMessageItem = memo(({ data }: NameOnMessageItemProps) => {
  const { name } = useName(data.sender)

  return <div className="text-xs font-bold">{name}</div>
})
