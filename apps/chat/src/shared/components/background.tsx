'use client'
import { images } from '@/assets/images'
import * as React from 'react'

function Background() {
  return (
    <div className="fixed inset-0 -z-[1] bg-black">
      <img src={images.backgroundMobile} alt="" className="w-full h-full object-cover" />
    </div>
  )
}

export default React.memo(Background)
