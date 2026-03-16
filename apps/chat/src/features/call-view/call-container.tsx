import { Call1v1, FeatureButtons, useCall, useCallEvents } from '@/features'
import { MyDebug } from '@/features/call-view/my-debug'
import { useCallStore } from '@/modules'
import { memo } from 'react'

export const CallContainer = memo(() => {
  useCall()
  useCallEvents()
  const status = useCallStore((s) => s.loadingStatus)
  const isDone = useCallStore((s) => s.isDone)

  return (
    <div className="h-screen w-screen overflow-hidden relative border border-black">
      <Call1v1 />
      <MyDebug />
      {!isDone && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p>{status}</p>
        </div>
      )}
      <FeatureButtons />
    </div>
  )
})
