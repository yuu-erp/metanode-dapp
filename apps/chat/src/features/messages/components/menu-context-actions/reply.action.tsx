'use client'

import * as React from 'react'
import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { Reply } from 'lucide-react'
import type { ActionProps } from './action.interface'
import { cn } from '@/shared/lib'

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
        <Reply className="size-5 text-black" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(ReplyAction)
