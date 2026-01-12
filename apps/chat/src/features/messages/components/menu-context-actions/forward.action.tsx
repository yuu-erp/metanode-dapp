'use client'

import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import { Forward } from 'lucide-react'
import * as React from 'react'
import type { ActionProps } from './action.interface'

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
        <Forward className="size-5 text-black" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(ForwardAction)
