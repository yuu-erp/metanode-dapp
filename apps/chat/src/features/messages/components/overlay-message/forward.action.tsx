'use client'

import { ForwardIcon } from '@/shared/components/icons'
import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import * as React from 'react'
import type { ActionProps } from '.'

export interface ForwardActionProps extends ActionProps {}

function ForwardAction({ className, ...props }: ForwardActionProps) {
  return (
    <DropdownMenuItem
      className={cn('text-lg flex items-center gap-3', className)}
      onSelect={props.onClose}
      {...props}
    >
      Chuyển tiếp
      <DropdownMenuShortcut>
        <ForwardIcon className="size-5 text-black" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(ForwardAction)
