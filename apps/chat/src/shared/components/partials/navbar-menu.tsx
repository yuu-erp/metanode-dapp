'use client'
import * as React from 'react'

function NavbarMenu() {
  return (
    <React.Fragment>
      <div
        className="h-[86px] fixed bottom-5 left-5 right-5 bg-black/20 border-app rounded-full"
        style={{
          boxShadow: '4px -4px 16px 0px #FFFFFF2E inset, 0px -2px 16px 0px #FFFFFF85 inset'
        }}
      ></div>
    </React.Fragment>
  )
}

export default React.memo(NavbarMenu)
