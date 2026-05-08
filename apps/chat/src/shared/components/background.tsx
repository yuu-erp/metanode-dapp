'use client'
import { images } from '@/assets/images'
import { usePlatform } from '@/hooks/core/use-platform'
import { useLocation } from '@tanstack/react-router'
import * as React from 'react'

function Background() {
  const { pathname } = useLocation()
  if (pathname === '/call') return null

  const { isNotPc } = usePlatform()

  return (
    <div className="fixed inset-0 -z-[1] bg-black">
      <img
        src={isNotPc ? images.backgroundMobile : images.backgroundDesktop}
        alt="Background Dapp Chat - Metanode"
        className="w-full h-full object-cover "
      />
    </div>
  )
}

export default React.memo(Background)
