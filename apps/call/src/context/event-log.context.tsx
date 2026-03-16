'use client'

import { CONTRACT_ADDRESSES } from '@/config'
import { callCtx } from '@/modules/call/call.ctx'
import type { JoinAnswerData, PullTrackFromNewPersonJoinData } from '@/modules/call/types'
import { container } from '@/modules/container'
import { asyncPriorityQueue } from '@/modules/realtime'
import { decodeDataFromBackend, formatAddress, queryKeys, useViewInput } from '@/shared'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface EventLogState {}

const EventLogContext = createContext<EventLogState | undefined>(undefined)

export function EventLogProvider({ children }: React.PropsWithChildren) {
  const { data: input } = useViewInput()
  const { isLoading = false } = useQuery({
    queryKey: queryKeys.registerDecode,
    enabled: !!input?.address,
    queryFn: async () => {
      container.eventLogContainer.eventLog
        .registerEvent(input!.address, [CONTRACT_ADDRESSES.meeting])
        .catch()

      container.eventLogContainer.registerAbi().catch()
      await new Promise<void>((res) => setTimeout(res, 2000))

      return true
    }
  })

  React.useEffect(() => {
    const eventlog = container.eventLogContainer.eventLog

    const offFrontendEvent = eventlog.on('FrontendEvent', async (data) => {
      console.log('thanhduy - offFrontendEvent 1', data)
      const input = await container.callService.getViewInput()
      if (formatAddress(data.toUser) !== formatAddress(input.address)) {
        callCtx.pushLog('frontend_event_skip_not_me', { eventType: data.eventType })
        return
      }

      const decodeData = decodeDataFromBackend(data.data)
      if (data.eventType === 'JOIN_ANSWER') {
        callCtx.pushLog('frontend_event_join_answer_received', {
          eventType: data.eventType
        })
        const joinAnswerData = decodeData as JoinAnswerData
        await asyncPriorityQueue.add(() =>
          container.callService.connectLocal(
            joinAnswerData.sessionDescription.sdp!,
            joinAnswerData.sessionId
          )
        )
      } else if (
        data.eventType === 'PULL_TRACK_FROM_NEW_PERSON_JOIN' ||
        data.eventType === 'PULL_TRACK_WHEN_ME_JOIN'
      ) {
        console.log('thanhduy - PULL_TRACK event', data)
        callCtx.pushLog('frontend_event_pull_track_received', {
          eventType: data.eventType
        })
        const pullTrackData = decodeData as PullTrackFromNewPersonJoinData
        await asyncPriorityQueue.add(() =>
          container.callService.connectRemote(
            pullTrackData.sessionDescription.sdp!,
            pullTrackData.sessionId
          )
        )
      }
    })

    const off = eventlog.onEventLog((data) => {
      console.log('thanhduy - onEventLog data', data)
    })

    return () => {
      offFrontendEvent()
      off()
    }
  }, [])

  console.log('thanhduy - EventLogProvider', isLoading)

  return (
    <EventLogContext.Provider value={{}}>
      {isLoading ? <p>Loading event logs</p> : children}
    </EventLogContext.Provider>
  )
}

export function useEventLog() {
  const ctx = useContext(EventLogContext)
  if (!ctx) throw new Error('useEventLog must be used within EventLogProvider')
  return ctx
}
