import { memo } from 'react'
import { useReactCall } from './hooks'

export const Call1v1 = memo(() => {
  const { users, localVideoRef, videosMap, midStreamsMap } = useReactCall()

  const user = users[0]

  return (
    <div className="absolute size-full z-0 bg-black">
      <div className="size-full relative">
        <div className="h-40 aspect-[0.75] absolute right-5 top-5 bg-black overflow-hidden flex justify-center rounded-md border">
          <video
            ref={localVideoRef}
            muted
            playsInline
            autoPlay
            className="h-full w-full object-cover "
          />
        </div>

        {user && (
          <video
            ref={(el) => {
              if (!el) return
              videosMap.current.set(user, el)
              const entry = midStreamsMap.current.get(user)
              if (entry) {
                el.srcObject = entry.stream
                el.play().catch(() => {})
              }
            }}
            playsInline
            autoPlay
            className="border border-black absolute size-full bg-black -z-1"
          />
        )}
      </div>
    </div>
  )
})
