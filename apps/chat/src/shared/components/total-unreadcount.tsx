'use client'
import * as React from 'react'
import { useCurrentAccount } from '../hooks'
import { useTotalUnreadCount } from '../hooks/conversations'
import { Badge, badgeVariants } from './ui/badge'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '../lib'

export interface TotalUnreadcountProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean
}
function TotalUnreadcount({ className, ...props }: TotalUnreadcountProps) {
  const { data: currentAccount } = useCurrentAccount()
  const { data: totalUnread = 0 } = useTotalUnreadCount(currentAccount?.address)
  if (totalUnread === 0) return null
  return (
    <React.Fragment>
      <Badge
        className={cn('h-5 min-w-5 rounded-full px-1 font-semibold tabular-nums', className)}
        {...props}
      >
        {totalUnread > 99 ? '99+' : totalUnread}
      </Badge>
    </React.Fragment>
  )
}

export default React.memo(TotalUnreadcount)
