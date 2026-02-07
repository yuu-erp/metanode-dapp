'use client'

import { images } from '@/assets'

export default function Background() {
  return (
    <div className="fixed inset-0 -z-[1] bg-black">
      <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-2xl"></div>
      <img
        src={images.background}
        alt="Background Dapp Chat - Metanode"
        className="w-full h-full object-cover"
      />
    </div>
  )
}
