'use client'

import { DownloadIcon } from 'lucide-react'
import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import * as React from 'react'
import type { ActionProps } from '.'
export interface SaveActionProps extends ActionProps {}

function SaveAction({ className, onClose, ...props }: SaveActionProps) {
  return (
    <DropdownMenuItem
      className={cn('text-lg flex items-center gap-3', className)}
      onSelect={onClose}
      {...props}
    >
      Tải xuống
      <DropdownMenuShortcut>
        <DownloadIcon className="size-5 text-black" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(SaveAction)
