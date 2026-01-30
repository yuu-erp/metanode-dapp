'use client'

import { CopyIcon } from '@/shared/components/icons'
import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import * as React from 'react'
import type { ActionProps } from '.'

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
        <CopyIcon className="size-5 text-black" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(CopyAction)
