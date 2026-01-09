'use client'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getAvatarFallback, getTelegramGradient } from '../helpers'
import { BookmarkIcon } from './icons'
import { cn } from '../lib'

interface AvatarUserProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  url?: string
  type?: 'USER' | 'PRIVATE' | 'GROUP'
}
function AvatarUser({ name, url, type, className, ...props }: AvatarUserProps) {
  return (
    <React.Fragment>
      <Avatar className={cn('size-15 rounded-full', className)} {...props}>
        <AvatarImage src={url} alt={`@${name}`} />
        <AvatarFallback
          className="rounded-full text-white text-2xl font-bold"
          style={{
            background:
              type === 'PRIVATE'
                ? 'linear-gradient(135deg, rgb(102, 95, 255), rgb(130, 177, 255))'
                : getTelegramGradient(name)
          }}
        >
          {type === 'PRIVATE' ? (
            <BookmarkIcon className="size-8 text-white" />
          ) : (
            getAvatarFallback(name)
          )}
        </AvatarFallback>
      </Avatar>
    </React.Fragment>
  )
}

export default React.memo(AvatarUser)
