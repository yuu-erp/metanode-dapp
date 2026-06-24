import { CONTRACT_ADDRESSES } from '@/config'
import { container } from '@/container'
import { CallLoading } from '@/features/call/call-loading'
import { Call1v1 } from '@/features/call/call-view/call-1v1'
import { CallGroup } from '@/features/call/call-view/call-group'
import { FeatureButtons } from '@/features/call/features-button'
import { PermissionPopup } from '@/features/call/features-button/permission-popup'
import { JoinRequest } from '@/features/call/join-request'
import { MembersInCall } from '@/features/call/members-in-call'
import { RaiseHandUsers } from '@/features/call/raise-hand-users'
import { ReactionInCall } from '@/features/call/reaction-in-call'
import { getUserByAddress } from '@/shared/hooks/conversations/use-user-by-address'

import { CallProvider, useRoomStore } from '@app/call'
import { createFileRoute, useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { useRef } from 'react'

export const Route = createFileRoute('/call')({
  component: RouteComponent
})

//@ts-ignore
container.eventLogContainer.eventLog.off = () => {}

function RouteComponent() {
  const isMeet = useRoomStore((s) => s.isMeet)
  const navigate = useNavigate()
  const router = useRouter()
  const search = useSearch({ strict: false })

  const ref = useRef<Function | null>(null)

  ref.current = router.history.back

  return (
    <>
      <div className="h-dvh w-dvw overflow-hidden bg-black">
        {/* <div className="fixed left-0 top-0 text-red-300 z-50">From App Chat</div> */}
        <CallProvider
          registerEventLog={() => container.eventLogContainer.registerAbi()}
          search={search}
          eventLog={container.eventLogContainer.eventLog as any}
          meetingAddress={CONTRACT_ADDRESSES.meeting}
          onRoomIdFetched={(roomId) => {
            navigate({
              to: '/call',
              replace: true,
              search: (prev) => ({
                ...prev,
                roomId
              })
            })
          }}
          onEndCall={() => {
            router.history.back()
          }}
          fetchNameByUser={async (myAddress, user) =>
            (await getUserByAddress(myAddress, user)).name
          }
        >
          {window.fiaiSDK ? (
            <div className="size-full overflow-hidden flex flex-col p-1">
              <div className="flex items-center gap-3 justify-end">
                <RaiseHandUsers />
                <JoinRequest />
                <MembersInCall />
              </div>
              <div className="flex-1 w-full overflow-hidden ">
                {isMeet ? <CallGroup /> : <Call1v1 />}
              </div>

              {/* <MyDebug /> */}
            </div>
          ) : null}
        </CallProvider>
      </div>
      <CallLoading />
      <FeatureButtons />
      <ReactionInCall />
      <PermissionPopup />
    </>
  )
}
