import { FeatureButtons } from '@/components'
import { Call1v1 } from '@/components/call-1v1'
import { useCall, useCallEvents } from '@/hooks'
import { useCallStore } from '@/modules'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent
})

function RouteComponent() {
  useCall()
  useCallEvents()
  const status = useCallStore((s) => s.loadingStatus)
  const isDone = useCallStore((s) => s.isDone)

  return (
    <>
      <div className="h-screen w-screen overflow-hidden relative">
        {window.finSdk && <Call1v1 />}
        {/* <MyDebug /> */}
        {!isDone && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <p>{status}</p>
          </div>
        )}
        <FeatureButtons />
      </div>
    </>
  )
}
