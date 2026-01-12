'use client'

import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { Copy } from 'lucide-react'
import * as React from 'react'
import type { ActionProps } from './action.interface'
import { cn } from '@/shared/lib'

export interface CopyActionProps extends ActionProps {}

function CopyAction({ className, ...props }: CopyActionProps) {
  return (
    <DropdownMenuItem
      className={cn('text-lg flex items-center gap-3', className)}
      onSelect={props.onClose}
      {...props}
    >
      Sao chép
      <DropdownMenuShortcut>
        <Copy className="size-5 text-black" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(CopyAction)
