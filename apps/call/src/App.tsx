import { callActions, CallProvider } from '@app/call'
import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import { endCall } from '@metanodejs/system-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import meetingAbi from './abis/meeting.abi.json'
import { CONTRACT_ADDRESSES } from './config'
import { CamButton } from './components/buttons/CamButton'
import { MicButton } from './components/buttons/MicButton'
import { EndCallButton } from './components/buttons/EndCallButton'

const decodeAbi = new DecodeAbi()
const eventLog = new EventLog(decodeAbi)
const queryClient = new QueryClient()

function App() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  const searchParams = new URLSearchParams(location.search)
  const search = {}
  searchParams.forEach((value, key) => {
    search[key] = value
  })

  useEffect(() => {
    ;(async () => {
      await Promise.all([
        decodeAbi.registerAbi(meetingAbi.filter((item) => item.type === 'event')),
        callActions.initEnable()
      ])
      setReady(true)
    })()

    eventLog.onEventLog((e) => {
      console.log('thanhduy - eventlog data', e)
    })
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
            fetchNameByUser={async (myAddress, user) => {
              return 'test'
            }}
          >
            <div className="fixed left-1/2 -translate-x-1/2 bottom-5 bg-black">
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
