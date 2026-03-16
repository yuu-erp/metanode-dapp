'use client'
import { type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { useCurrentAccount } from '../hooks'
import { useTotalUnreadCount } from '../hooks/conversations'
import { cn } from '../lib'
import { Badge, badgeVariants } from './ui/badge'

export interface TotalUnreadcountProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean
}
function TotalUnreadcount({ className, ...props }: TotalUnreadcountProps) {
  const { data: currentAccount } = useCurrentAccount()
  const { data: totalUnread = 0 } = useTotalUnreadCount(currentAccount)

  if (totalUnread === 0) return null
  return (
    <React.Fragment>
      <Badge
        className={cn('h-5 min-w-5 rounded-full px-1 font-semibold tabular-nums', className)}
        {...props}
      >
        {totalUnread > 999 ? '999+' : totalUnread}
      </Badge>
    </React.Fragment>
  )
}

export default React.memo(TotalUnreadcount)
