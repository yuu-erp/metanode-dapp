import { CallProvider } from '@app/call'
import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import { endCall } from '@metanodejs/system-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import meetingAbi from './abis/meeting.abi.json'
import { CamButton } from './components/buttons/CamButton'
import { EndCallButton } from './components/buttons/EndCallButton'
import { MicButton } from './components/buttons/MicButton'
import { CONTRACT_ADDRESSES } from './config'

const decodeAbi = new DecodeAbi()
const eventLog = new EventLog(decodeAbi)
const queryClient = new QueryClient()

console.log('[APP CALL] VERSION 1.0.0')

function App() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  const searchParams = new URLSearchParams(location.search)
  const search: any = {}
  searchParams.forEach((value, key) => {
    search[key] = value
  })

  useEffect(() => {
    ;(async () => {
      await decodeAbi.registerAbi(meetingAbi.filter((item) => item.type === 'event'))
      setReady(true)
    })()
  }, [])
  return (
    <>
      <QueryClientProvider client={queryClient}>
        {ready && (
          <CallProvider
            registerEventLog={async () => {}}
            search={search}
            eventLog={eventLog as any}
            meetingAddress={CONTRACT_ADDRESSES.meeting}
            onRoomIdFetched={(roomId) => {
              const params = new URLSearchParams(window.location.search) // hoặc dùng search mới nhất
              params.set('roomId', roomId)
              navigate(
                {
                  pathname: '/call',
                  search: params.toString()
                },
                { replace: true }
              )
            }}
            onEndCall={endCall}
            fetchNameByUser={async () => ''}
          >
            <div className="fixed left-1/2 -translate-x-1/2 bottom-5 flex gap-3">
              <CamButton />
              <MicButton />
              <EndCallButton />
            </div>
          </CallProvider>
        )}
      </QueryClientProvider>
    </>
  )
}

export default App
