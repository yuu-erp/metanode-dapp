'use client'
import { images } from '@/assets/images'
import * as React from 'react'

function Background() {
  return (
    <div className="fixed inset-0 -z-[1] bg-black">
      <img
        src={images.backgroundMobile}
        alt="Background Dapp Chat - Metanode"
        className="w-full h-full object-cover md:hidden"
      />
      <img
        src={images.backgroundDesktop}
        alt="Background Dapp Chat - Metanode"
        className="w-full h-full object-cover hidden md:block"
      />
    </div>
  )
}

export default React.memo(Background)
