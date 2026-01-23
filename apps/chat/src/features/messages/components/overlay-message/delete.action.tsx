'use client'

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import { Trash2 } from 'lucide-react'
import * as React from 'react'
import type { ActionProps } from '.'

export interface DeleteActionProps extends ActionProps {}

function DeleteAction({ className, ...props }: DeleteActionProps) {
  return (
    <React.Fragment>
      <DropdownMenuSeparator className="h-1 bg-black/10" />
      <DropdownMenuItem
        className={cn('text-lg flex items-center gap-3 text-red-500', className)}
        onSelect={props.onClose}
        {...props}
      >
        Xoá tin nhắn
        <DropdownMenuShortcut>
          <Trash2 className="size-5 text-red-500" />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    </React.Fragment>
  )
}

export default React.memo(DeleteAction)
