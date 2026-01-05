'use client'
import * as React from 'react'

function ListMessage() {
  return (
    <React.Fragment>
      <div className="w-full flex-1 h-full pt-[120px]">Xin chào</div>
    </React.Fragment>
  )
}

export default React.memo(ListMessage)
