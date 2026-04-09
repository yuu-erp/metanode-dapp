import { container } from '@/container'
import { ApplyMeetingName } from '@/features/call/apply-meeting-name'
import { MeetingAccountInfo } from '@/features/call/meeting-account-info'
import { useCurrentAccount } from '@/shared/hooks'
import { handleMessageError } from '@/shared/utils/errorNative'
import { getHiddenWallet } from '@metanodejs/system-core'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { isAddress } from 'ethers'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/setup-meeting')({
  component: RouteComponent
})

function RouteComponent() {
  const { data: account, isFetched } = useCurrentAccount()
  const [loading, setLoading] = useState(true)
  const search: any = useSearch({ strict: false })
  const navigate = useNavigate()

  useEffect(() => {
    const validate = async () => {
      try {
        if (!isAddress(search.caller) || !isAddress(search.roomId)) throw new Error('Invalid url')
        const hiddenWallet = await getHiddenWallet()
        const roomInfo = await container.meetingContract.rooms({
          from: hiddenWallet.address,
          inputData: { '': search.roomId }
        })

        const active = roomInfo.active
        if (!active) throw new Error('Room is not exist')
      } catch (error) {
        navigate({
          to: '/error',
          search: {
            message: handleMessageError(error)
          }
        })
      } finally {
        setLoading(false)
      }
    }
    validate()
  }, [account])

  if (loading)
    return (
      <div className="h-dvh w-dvw flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  return (
    <div className="h-dvh w-dvw flex">
      <div className="w-2/3 h-full flex justify-center items-center p-3">
        <div className="w-full max-w-160 rounded-2xl aspect-video bg-black" />
      </div>
      <div className="flex-1 h-full flex justify-center items-center">
        <div className="flex flex-col gap-3 items-center p-5 w-full">
          <p className="text-2xl">Join</p>
          {isFetched && (
            <>{account ? <MeetingAccountInfo account={account} /> : <ApplyMeetingName />}</>
          )}
        </div>
      </div>
    </div>
  )
}
