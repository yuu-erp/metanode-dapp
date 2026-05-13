import { Status } from '@/@types/enum'
import { cn } from '@/lib'
import { memo } from 'react'

export type UserStatusProps = {
  value: Status
}

export const UserStatus = memo(({ value }: UserStatusProps) => {
  const isActive = value === Status.active
  const color = isActive ? 'bg-green-400' : 'bg-red-400'

  return (
    <div className="flex items-center gap-2">
      <div className={cn('size-1.5 rounded-full', color)} />
      <p>{isActive ? 'Active' : 'InActive'}</p>
    </div>
  )
})
