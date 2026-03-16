import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/meeting')({
  component: RouteComponent
})

function RouteComponent() {
  // const { data: account } = useCurrentAccount()

  // const ready = chatClient.useSetupContactAddress(account?.address || '')
  //@ts-ignore
  // chatClient.useOnMeetingEvents(!!window?.finSdk)

  useEffect(() => {
    // chatClient.setupCall()
  }, [])

  return (
    <>
      {/* {ready ? <CallDirectContainer /> : null}
      <BottomButtons /> */}
    </>
  )
}

// const CallDirectContainer = memo(() => {
//   const stream = useRef(new MediaStream())
//   const { myConnections, remotes } = chatClient.useMeetingUi()

//   useEffect(() => {
//     const cleanups: (() => void)[] = []

//     remotes.forEach((r) => {
//       const onTrack = (e: RTCTrackEvent) => {
//         stream.current.addTrack(e.track)
//       }

//       r.pc.addEventListener('track', onTrack)
//       cleanups.push(() => r.pc.removeEventListener('track', onTrack))
//     })

//     return () => cleanups.forEach((fn) => fn())
//   }, [remotes])

//   return (
//     <>
//       <div className="size-full relative overflow-hidden">
//         <div className="absolute right-5 top-5 flex">
//           {myConnections.map((connection) => (
//             <video
//               className="size-40"
//               ref={(el) => {
//                 if (!el || !connection.stream) return
//                 el.srcObject = connection.stream
//                 el.play()
//               }}
//             />
//           ))}
//         </div>

//         <video
//           ref={(el) => {
//             if (!el) return
//             el.srcObject = stream.current
//             el.play()
//           }}
//           className="size-full"
//         />
//       </div>
//     </>
//   )
// })
