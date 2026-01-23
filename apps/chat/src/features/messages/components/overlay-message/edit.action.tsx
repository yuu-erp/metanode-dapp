'use client'

import { EditIcon } from '@/shared/components/icons'
import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import * as React from 'react'
import type { ActionProps } from '.'

export interface EditActionProps extends ActionProps {}

function EditAction({ className, ...props }: EditActionProps) {
  return (
    <DropdownMenuItem
      className={cn('text-lg flex items-center gap-3', className)}
      onSelect={props.onClose}
      {...props}
    >
      Chỉnh sửa
      <DropdownMenuShortcut>
        <EditIcon className="size-5 text-black" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(EditAction)
