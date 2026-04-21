'use client'
import * as React from 'react'
import { Button } from '../../ui/button'
import { BACKGROUND_IMAGE_LIGHT } from '@/constants/background'

function Photo() {
  return (
    <React.Fragment>
      <div className="w-full h-full flex flex-col gap-2 overflow-hidden">
        <div className="w-full flex items-center gap-2">
          <Button className="flex-1 bg-white text-black/60 font-semibold h-10">Take Picture</Button>
          <Button className="flex-1 bg-white text-black/60 font-semibold h-10">Take Picture</Button>
        </div>
        <div className="flex-1 w-full overflow-y-auto">
          <div className="w-full h-full overflow-y-auto">
            <div className="grid gap-2">
              <p>Light</p>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUND_IMAGE_LIGHT.map((item) => (
                  <img key={item.id} src={item.small} />
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <p>Light</p>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUND_IMAGE_LIGHT.map((item) => (
                  <img key={item.id} src={item.small} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(Photo)
