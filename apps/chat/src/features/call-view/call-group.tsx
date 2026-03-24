import { memo } from 'react'
import { useReactCall } from './hooks'

export const CallGroup = memo(() => {
  const { users, localVideoRef, videosMap, midStreamsMap } = useReactCall()

  const total = users.length + 1 // +1 cho local
  const cols = Math.ceil(Math.sqrt(total))

  return (
    <>
      <div
        className="size-full grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
        }}
      >
        {/* Local */}
        <video
          ref={localVideoRef}
          muted
          playsInline
          autoPlay
          className="w-full h-full object-contain bg-black rounded-lg"
        />

        {/* Remote */}
        {users.map((user) => (
          <video
            key={user}
            className="w-full h-full object-contain bg-black rounded-lg border"
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
          />
        ))}
      </div>
    </>
  )
})
