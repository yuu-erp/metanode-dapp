'use client'

import { ReplyIcon } from '@/shared/components/icons'
import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import * as React from 'react'
import type { ActionProps } from '.'

export interface ReplyActionProps extends ActionProps {}

function ReplyAction({ className, ...props }: ReplyActionProps) {
  return (
    <DropdownMenuItem
      className={cn('text-lg flex items-center gap-3', className)}
      onSelect={props.onClose}
      {...props}
    >
      Trả lời
      <DropdownMenuShortcut>
        <ReplyIcon className="size-5 text-black" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(ReplyAction)
