'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getAvatarFallback, getTelegramGradient } from '../helpers'
import { BookmarkIcon } from './icons'
import { cn } from '../lib'
import type { ConversationType } from '@/modules/conversation'

/* ---------------------------------- */
/* Avatar variants (default sizes) */
/* ---------------------------------- */
const avatarVariants = cva('rounded-full shrink-0', {
  variants: {
    size: {
      xs: 'size-8',
      sm: 'size-10', // 40px
      md: 'size-12', // 48px
      lg: 'size-15', // 60px
      xl: 'size-20', // 80px
      '2xl': 'size-24' // 96px
    }
  },
  defaultVariants: {
    size: 'lg'
  }
})

const fallbackTextVariants = cva('font-bold text-white', {
  variants: {
    size: {
      xs: 'text-sm',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-2xl',
      xl: 'text-3xl',
      '2xl': 'text-4xl'
    }
  },
  defaultVariants: {
    size: 'lg'
  }
})

const bookmarkIconVariants = cva('text-white', {
  variants: {
    size: {
      xs: 'size-4',
      sm: 'size-4',
      md: 'size-7',
      lg: 'size-8',
      xl: 'size-10',
      '2xl': 'size-12'
    }
  },
  defaultVariants: {
    size: 'lg'
  }
})

/* ---------------------------------- */
/* Props */
/* ---------------------------------- */
interface AvatarUserProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  name: string
  url?: string
  type?: ConversationType
  /** Custom sizes (px) */
  avatarSize?: number
  textSize?: number
  iconSize?: number
}

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */
function resolveSize(size?: number) {
  if (!size) return undefined
  return {
    width: size,
    height: size
  }
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */
function AvatarUser({
  name,
  url,
  type = 'p2p',
  size,
  avatarSize,
  textSize,
  iconSize,
  className,
  ...props
}: AvatarUserProps) {
  const isCustomAvatarSize = typeof avatarSize === 'number'

  const isGroup = type === 'group' || type === 'anonymous_group'

  return (
    <Avatar
      className={cn(
        'rounded-full shrink-0',
        !isCustomAvatarSize && avatarVariants({ size }),
        isGroup && 'rounded-2xl',
        className
      )}
      style={resolveSize(avatarSize)}
      {...props}
    >
      {type !== 'private' && <AvatarImage src={url} alt={`@${name}`} />}
      <AvatarFallback
        className={cn(
          'rounded-full flex items-center justify-center',
          isGroup && 'rounded-2xl',
          !textSize && fallbackTextVariants({ size })
        )}
        style={{
          background:
            type === 'private'
              ? 'linear-gradient(135deg, rgb(102, 95, 255), rgb(130, 177, 255))'
              : getTelegramGradient(name),
          fontSize: textSize
        }}
      >
        {type === 'private' ? (
          <BookmarkIcon
            className={cn(!iconSize && bookmarkIconVariants({ size }))}
            style={{
              width: iconSize,
              height: iconSize
            }}
          />
        ) : (
          getAvatarFallback(name)
        )}
      </AvatarFallback>
    </Avatar>
  )
}

export default React.memo(AvatarUser)
