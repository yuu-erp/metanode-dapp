import { container } from '@/container'
import { useCall } from '@/modules/call'
import { memo, useEffect } from 'react'
import { Call1v1 } from './call-1v1'
import { FeatureButtons } from './features-button'
import { useSetupCall } from './hooks/use-setup-call'
import { useCallEvents } from './hooks/use-call-events'
import { CallGroup } from './call-group'

export const CallContainer = memo(() => {
  useSetupCall()
  useCallEvents()
  const message = useCall((s) => s.message)
  const joinLoading = useCall((s) => s.joinLoading)
  const connected = useCall((s) => s.connected)
  const isMeet = useCall((s) => s.isMeet)

  useEffect(() => {
    const off = container.eventLogContainer.eventLog.onEventLog((data) => {
      console.log('thanhduy - eventlog data', data)
    })
    return () => off()
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden relative border border-black">
      {isMeet ? <CallGroup /> : <Call1v1 />}
      {/* <MyDebug /> */}
      {!connected && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p>{message}</p>
        </div>
      )}
      {!joinLoading && <FeatureButtons />}
    </div>
  )
})
