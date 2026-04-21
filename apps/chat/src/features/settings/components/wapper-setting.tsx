'use client'

import * as React from 'react'

interface WapperSettingProps extends React.HTMLAttributes<HTMLDivElement> {}
function WapperSetting({ children, style, ...props }: WapperSettingProps) {
  return (
    <React.Fragment>
      <div
        className="p-3 w-full bg-white/70 text-gray-900 rounded-4xl"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    </React.Fragment>
  )
}

export default React.memo(WapperSetting)
