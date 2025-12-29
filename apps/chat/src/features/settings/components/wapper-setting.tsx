'use client'

import * as React from 'react'

interface WapperSettingProps extends React.HTMLAttributes<HTMLDivElement> {}
function WapperSetting({ children, ...props }: WapperSettingProps) {
  return (
    <React.Fragment>
      <div className="p-3 w-full bg-black/40 border-app rounded-4xl" {...props}>
        {children}
      </div>
    </React.Fragment>
  )
}

export default React.memo(WapperSetting)
