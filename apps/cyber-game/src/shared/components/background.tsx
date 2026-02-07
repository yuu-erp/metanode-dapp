'use client'

import { images } from '@/assets'

export default function Background() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg-app"></div>
      <img src={images.background} alt="Background" className="w-full h-full object-cover" />
    </div>
  )
}
