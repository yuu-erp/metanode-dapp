'use client'
import * as React from 'react'
import DrawerChooseBackground from './drawer-choose-background'

function WallpaperContainer() {
  return (
    <React.Fragment>
      <DrawerChooseBackground />
    </React.Fragment>
  )
}

export default React.memo(WallpaperContainer)
