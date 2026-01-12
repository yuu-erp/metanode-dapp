'use client'
import AvatarUser from '@/shared/components/avatar-user'
import * as React from 'react'

function ReactionMessage() {
  return (
    <React.Fragment>
      <div className="h-6.5 px-1 bg-blue-500 rounded-full flex items-center justify-center">
        <span>😍</span>
        <div className="flex -space-x-3">
          <AvatarUser name="Yuu" className="size-5" />
          <AvatarUser name="Wallet" className="size-5" />
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ReactionMessage)
