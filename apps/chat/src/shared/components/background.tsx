'use client'
import { images } from '@/assets/images'
import { usePlatform } from '@/hooks/core/use-platform'
import { useLocation } from '@tanstack/react-router'
import * as React from 'react'
import { cn } from '../lib'

function Background() {
  const { pathname } = useLocation()

  const { isNotWeb } = usePlatform()

  return (
    <div className={cn('fixed inset-0 -z-[1] bg-black', pathname === '/call' && 'hidden')}>
      <img
        src={isNotWeb ? images.backgroundMobile : images.backgroundDesktop}
        alt="Background Dapp Chat - Metanode"
        className="w-full h-full object-cover "
      />
    </div>
  )
}

export default React.memo(Background)
