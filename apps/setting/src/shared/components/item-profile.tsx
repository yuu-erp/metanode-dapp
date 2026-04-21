'use client'
import * as React from 'react'
import { cn } from '../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getAvatarFallback } from '../utils'
import { ChevronRight } from 'lucide-react'

interface ItemProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  avatarURL?: string
  name: string
  subContent?: string
  Icon?: React.ComponentType<{ className: string }>
  AvatarIcon?: React.ComponentType<{ className?: string }>
}
function ItemProfile({
  avatarURL,
  name,
  subContent,
  className,
  Icon,
  AvatarIcon,
  ...props
}: ItemProfileProps) {
  return (
    <div className={cn('w-full h-14', className)} {...props}>
      <div className="w-full h-full flex items-center gap-2 px-2">
        {AvatarIcon ? (
          <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full">
            <AvatarIcon className="size-6 text-black/60" />
          </div>
        ) : (
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage src={avatarURL} alt={name} />
            <AvatarFallback className="rounded-full text-black/60 font-bold">
              {getAvatarFallback(name)}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="grid flex-1 text-left text-base leading-tight">
          <span className="truncate font-bold text-black/60">{name}</span>
          {subContent && (
            <span className="text-muted-foreground truncate text-sm">{subContent}</span>
          )}
        </div>
        {Icon ? (
          <Icon className="size-5 text-black/60" />
        ) : (
          <ChevronRight className="size-5 text-black/60" />
        )}
      </div>
    </div>
  )
}

export default React.memo(ItemProfile)
