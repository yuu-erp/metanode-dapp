'use client'

import { ScanQrCode } from 'lucide-react'
import * as React from 'react'

function SettingHeader() {
  return (
    <React.Fragment>
      <div className="w-full px-3 flex items-center justify-between">
        <button>
          <ScanQrCode className="size-7" />
        </button>
        <button className="text-lg">Sửa</button>
      </div>
    </React.Fragment>
  )
}

export default React.memo(SettingHeader)
