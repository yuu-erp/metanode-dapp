import { blockchain, callContext, eventBus, eventLog, ICE_SERVERS, useCallStore } from '@/modules'
import { compareAddress, decodeDataFromBackend, encodeDataToBackend } from '@/shared'
import { setAnswerSDP, setOfferSDP } from '@metanodejs/system-core'
import { useEventLog } from './use-event-log'
import { useEffect, useRef } from 'react'

export type JoinAnswerData = {
  sessionDescription: RTCSessionDescriptionInit
  sessionId: string
}

export type PullTrackData = {
  sessionDescription: RTCSessionDescriptionInit
  requiresImmediateRenegotiation: boolean
  sessionId: string
  sourceUser: string
}

export function useCallEvents() {
  const userSourceSet = useRef(new Set<string>())

  async function emitSdpAnswerToBackend(sdp_answer: string, sessionId: string) {
    const { address, roomId } = callContext

    const sdpAnswerData = {
      ToUser: address,
      AnswerSDP: sdp_answer
    }

    await blockchain.meeting.emitEventToBackend({
      from: address,
      inputData: {
        _eventType: 'SDP_ANSWER',
        _roomId: roomId!,
        _sessionId: sessionId,
        _data: encodeDataToBackend(sdpAnswerData)
      }
    })
  }

  async function connectLocal(sdp_answer: string, sessionId: string) {
    const { localPc, localTracks, address, roomId } = callContext
    useCallStore.setState({ loadingStatus: 'Start connect local...' })
    if (window.finSdk) {
      await localPc.setRemoteDescription({ type: 'answer', sdp: sdp_answer })
    } else {
      await setAnswerSDP(sdp_answer)
    }
    await emitSdpAnswerToBackend(sdp_answer, sessionId)

    const addTrackData = {
      Track: localTracks
    }
    eventBus.emit('connect-local', '[emit-backend] connect local')
    await blockchain.meeting.emitEventToBackend({
      from: address,
      inputData: {
        _eventType: 'ADD_TRACK',
        _roomId: roomId,
        _sessionId: sessionId,
        _data: encodeDataToBackend(addTrackData)
      }
    })
    useCallStore.setState({ loadingStatus: 'Finish connect local...' })

    eventBus.emit('connect-local', '[emit-backend] add local track')
  }

  async function connectRemote(sdp_offer: string, sessionId: string) {
    const { localPc } = callContext
    useCallStore.setState({ loadingStatus: 'Start connect remote...' })

    let sdpAnswer = ''
    if (window.finSdk) {
      const pc = localPc

      await pc.setRemoteDescription({ type: 'offer', sdp: sdp_offer })
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      sdpAnswer = answer.sdp!
    } else {
      sdpAnswer = await setOfferSDP(sdp_offer, ICE_SERVERS)
    }

    await emitSdpAnswerToBackend(sdpAnswer, sessionId)
    useCallStore.setState({ loadingStatus: 'Finish connect remote...' })
  }

  useEventLog('FrontendEvent', async (event) => {
    const { address } = callContext
    const sources = userSourceSet.current

    if (!compareAddress(event.toUser, address)) return

    const decodeData = decodeDataFromBackend(event.data)
    switch (event.eventType) {
      case 'JOIN_ANSWER': {
        const data = decodeData as JoinAnswerData
        callContext.setState({ localSessionId: data.sessionId })
        await connectLocal(data.sessionDescription.sdp!, data.sessionId)
        break
      }
      case 'PULL_TRACK_FROM_NEW_PERSON_JOIN': {
        const data = decodeData as PullTrackData
        if (sources.has(data.sourceUser)) {
        } else {
          sources.add(data.sourceUser)
        }

        callContext.setState({ remoteSessionId: data.sessionId })
        await connectRemote(data.sessionDescription.sdp!, data.sessionId)
        break
      }

      case 'PULL_TRACK_WHEN_ME_JOIN': {
        const data = decodeData as PullTrackData
        callContext.setState({ remoteSessionId: data.sessionId })
        await connectRemote(data.sessionDescription.sdp!, data.sessionId)
        break
      }

      case 'PULL_TRACK_FROM_REJOINED_USER': {
        const data = decodeData as PullTrackData
        callContext.setState({ remoteSessionId: data.sessionId })
        await connectRemote(data.sessionDescription.sdp!, data.sessionId)
        break
      }
    }
  })

  useEffect(() => {
    eventLog.eventLog.onEventLog((data) => {
      console.log('thanhduy - event log data', data)
    })
  }, [])
}
