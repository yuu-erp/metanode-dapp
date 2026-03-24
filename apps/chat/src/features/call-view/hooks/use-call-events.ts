import { container } from '@/container'
import { setAnswerSDP, setOfferSDP } from '@metanodejs/system-core'
import { callActions, callStore, useCall } from '../../../modules/call/call.store'
import {
  compareAddress,
  decodeDataFromBackend,
  encodeDataToBackend,
  ICE_SERVERS
} from '../../../modules/call/lib'
import { useEventLog } from './use-event-log'

export type JoinAnswerData = {
  sessionDescription: RTCSessionDescriptionInit
  sessionId: string
}

export type PullTrackData = {
  sessionDescription: RTCSessionDescriptionInit
  requiresImmediateRenegotiation: boolean
  sessionId: string
  sourceUser: string
  tracks: { location: string; mid: string; trackName: string }[]
}

const contract = container.meetingContract
const eventBus = container.eventBus

export function useCallEvents() {
  const localPc = useCall((s) => s.localPc)

  async function emitSdpAnswerToBackend(sdp_answer: string, sessionId: string) {
    const { address, roomId, hiddenAddress } = callStore.getState()

    const sdpAnswerData = {
      ToUser: address,
      AnswerSDP: sdp_answer
    }

    await contract.emitEventToBackend({
      from: hiddenAddress,
      inputData: {
        _eventType: 'SDP_ANSWER',
        _roomId: roomId!,
        _sessionId: sessionId,
        _data: encodeDataToBackend(sdpAnswerData)
      }
    })
  }

  async function connectLocal(sdp_answer: string, sessionId: string) {
    const { localTracks, roomId, hiddenAddress } = callStore.getState()
    if (!localPc) return
    callActions.setMessage('Set remote desc from server...')
    if (window.finSdk) {
      await localPc.setRemoteDescription({ type: 'answer', sdp: sdp_answer })
    } else {
      await setAnswerSDP(sdp_answer)
    }
    callActions.setMessage('Emit set answer to backend...')
    await emitSdpAnswerToBackend(sdp_answer, sessionId)

    const addTrackData = {
      Track: localTracks
    }
    callActions.setMessage('Emit add track to backend...')
    await contract.emitEventToBackend({
      from: hiddenAddress,
      inputData: {
        _eventType: 'ADD_TRACK',
        _roomId: roomId,
        _sessionId: sessionId,
        _data: encodeDataToBackend(addTrackData)
      }
    })
    callActions.setMessage('Connect local success...')
  }

  async function connectRemote(sdp_offer: string, sessionId: string) {
    callActions.setMessage('Start connect remote...')

    let sdpAnswer = ''
    if (window.finSdk) {
      if (!localPc) return
      const pc = localPc

      await pc.setRemoteDescription({ type: 'offer', sdp: sdp_offer })
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      sdpAnswer = answer.sdp!
    } else {
      sdpAnswer = await setOfferSDP(sdp_offer, ICE_SERVERS)
    }
    callActions.setMessage('Emit set remote answer to backend...')

    await emitSdpAnswerToBackend(sdpAnswer, sessionId)
    callActions.setMessage('Finish connect remote...')
  }

  useEventLog('FrontendEvent', async (event) => {
    const { hiddenAddress } = callStore.getState()
    const decodeData = decodeDataFromBackend(event.data)

    if (!compareAddress(event.toUser, hiddenAddress)) return

    switch (event.eventType) {
      case 'JOIN_ANSWER': {
        const data = decodeData as JoinAnswerData
        callStore.setState({ sessionId: data.sessionId })
        await connectLocal(data.sessionDescription.sdp!, data.sessionId)
        break
      }
      case 'PULL_TRACK_FROM_NEW_PERSON_JOIN': {
        const data = decodeData as PullTrackData
        eventBus.emit('call.update-mid-per-user', {
          user: data.sourceUser,
          mids: data.tracks.map((t) => t.mid)
        })

        await connectRemote(data.sessionDescription.sdp!, data.sessionId)
        break
      }

      case 'PULL_TRACK_WHEN_ME_JOIN': {
        const data = decodeData as PullTrackData
        eventBus.emit('call.update-mid-per-user', {
          user: data.sourceUser,
          mids: data.tracks.map((t) => t.mid)
        })
        await connectRemote(data.sessionDescription.sdp!, data.sessionId)
        break
      }

      case 'PULL_TRACK_FROM_REJOINED_USER': {
        const data = decodeData as PullTrackData
        await connectRemote(data.sessionDescription.sdp!, data.sessionId)
        break
      }
    }
  })

  useEventLog('LeaveRequested', (data) => {
    const { isMeet, roomId } = callStore.getState()
    if (!roomId || !compareAddress(roomId, data.roomId)) return
    if (isMeet) {
      eventBus.emit('call.remove-user', {
        user: data.requester
      })

      return
    }
    eventBus.emit('call.end', null)
  })

  useEventLog('CallRejected', (data) => {
    const { isMeet, roomId } = callStore.getState()
    if (isMeet || !compareAddress(roomId, data.roomId)) return
    eventBus.emit('call.end', null)
  })

  useEventLog('CallReceived', async (data) => {
    const { hiddenAddress } = callStore.getState()

    const cb = () =>
      container.meetingContract.rejectCall({
        from: hiddenAddress,
        inputData: {
          _caller: data.caller,
          _roomId: data.roomId
        }
      })

    await cb()
  })
}
