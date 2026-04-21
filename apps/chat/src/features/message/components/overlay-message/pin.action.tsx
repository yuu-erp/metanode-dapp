'use client'

import { DropdownMenuItem, DropdownMenuShortcut } from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import { PinIcon, PinOffIcon } from 'lucide-react'
import * as React from 'react'

export interface PinActionProps {
  isPinned: boolean
  onClose: () => void
  className?: string
}

function PinAction({ isPinned, className, onClose }: PinActionProps) {
  return (
    <DropdownMenuItem
      className={cn('text-lg flex items-center gap-3', className)}
      onSelect={onClose}
    >
      {isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
      <DropdownMenuShortcut>
        {isPinned ? (
          <PinOffIcon className="size-5 text-black" />
        ) : (
          <PinIcon className="size-5 text-black" />
        )}
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default React.memo(PinAction)
