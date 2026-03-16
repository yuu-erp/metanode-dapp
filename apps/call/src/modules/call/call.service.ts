import { encodeDataToBackend, formatAddress, queryClient, queryKeys, randomBytes32 } from '@/shared'
import type { Blockchain } from '../blockchain'
import type { MeetingViewInput, ReqAddTrack, ReqSdpAnswer } from './types'
import type { EventLogsContainer } from '../eventlogs/eventlogs-container'
import { v4 } from 'uuid'
import { extractMidTrackArray, ICE_SERVERS } from './helper'
import { registerWebRTCIce, setAnswerSDP, setOfferSDP } from '@metanodejs/system-core'
import type { ReqTrack } from '../blockchain/types'
import { callCtx } from './call.ctx'

export class CallService {
  constructor(
    private readonly blockchain: Blockchain,
    private readonly eventlogContainer: EventLogsContainer
  ) {}

  async createRoom(input: MeetingViewInput) {
    callCtx.pushLog('create_room_start', { address: input.address, callee: input.callee })
    const promise = new Promise<{
      roomId: string
      requestId: string
    }>(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        off()
        reject(new Error('Create call timeout'))
      }, 15000)

      const off = this.eventlogContainer.eventLog.on('RoomCreateRequested', async (event) => {
        console.log('RoomCreateRequested', event)
        if (formatAddress(event.requester) === formatAddress(input.address)) {
          clearTimeout(timeout)
          off() // Stop listening
          resolve({
            roomId: event.roomId,
            requestId: event.requestId
          })
        }
      })
    })
    console.log('thanhduy - createRoom 1')
    await this.blockchain.meeting.createRoom({
      from: input.address,
      inputData: {
        _receiver: input.callee,
        meet: input.isMeet,
        requestId: randomBytes32(),
        roomName: `Room-${input.address}`
      }
    })
    console.log('thanhduy - createRoom 2')

    const rs = await promise
    console.log('thanhduy - createRoom 3', rs)
    callCtx.pushLog('create_room_done', rs)

    return rs
  }

  async joinRoom(input: MeetingViewInput, roomId: string) {
    if (callCtx.joinState === 'connecting') {
      throw new Error('Join room is already in progress')
    }

    if (callCtx.joinState === 'joined' && callCtx.activeRoomId === roomId) {
      if (callCtx.isConnectionHealthy() && callCtx.activeSessionId) {
        return { sessionId: callCtx.activeSessionId, sdpOffer: '' }
      }
      callCtx.cleanupPeerState()
    }

    const sessionId = v4()
    let sdpOffer = ''
    callCtx.pushLog('join_room_start', { roomId, sessionId })
    console.log('thanhduy - joinRoom 1')
    callCtx.joinState = 'connecting'
    callCtx.activeRoomId = roomId
    callCtx.activeSessionId = sessionId

    try {
      if (window.finSdk) {
        const pc = callCtx.pc
        const remotePc = callCtx.remotePc
        const handleConnectionStateChange = () => {
          const fatalStates = ['failed', 'closed']
          const transientState = 'disconnected'
          callCtx.pushLog('pc_connection_state', {
            localState: pc.connectionState,
            remoteState: remotePc.connectionState
          })

          if (fatalStates.includes(pc.connectionState)) {
            callCtx.pushLog('pc_connection_cleanup_fatal', {
              localState: pc.connectionState,
              remoteState: remotePc.connectionState
            })
            callCtx.cleanupPeerState()
            return
          }

          if (fatalStates.includes(remotePc.connectionState)) {
            callCtx.pushLog('remote_pc_failed_keep_local_alive', {
              localState: pc.connectionState,
              remoteState: remotePc.connectionState
            })
            callCtx.resetRemotePeerState()
            return
          }

          if (pc.connectionState === transientState) {
            if (!callCtx.disconnectCleanupTimer) {
              callCtx.pushLog('pc_connection_disconnected_wait_recover')
              callCtx.disconnectCleanupTimer = window.setTimeout(() => {
                callCtx.disconnectCleanupTimer = undefined
                const localStateNow = pc.connectionState
                if (localStateNow === transientState || fatalStates.includes(localStateNow)) {
                  callCtx.pushLog('pc_connection_cleanup_after_timeout', {
                    localState: localStateNow,
                    remoteState: remotePc.connectionState
                  })
                  callCtx.cleanupPeerState()
                } else {
                  callCtx.pushLog('pc_connection_recovered_before_timeout')
                }
              }, 10000)
            }
            return
          }

          if (remotePc.connectionState === transientState) {
            callCtx.pushLog('remote_pc_disconnected_wait_backend_pull')
            return
          }

          if (callCtx.disconnectCleanupTimer) {
            window.clearTimeout(callCtx.disconnectCleanupTimer)
            callCtx.disconnectCleanupTimer = undefined
            callCtx.pushLog('pc_connection_recovered')
          }
        }
        pc.addEventListener('connectionstatechange', handleConnectionStateChange)
        remotePc.addEventListener('connectionstatechange', handleConnectionStateChange)
        console.log('thanhduy - joinRoom 2')
        const devices = await navigator.mediaDevices.enumerateDevices()
        console.log({ devices })
        const hasVideoInput = devices.some((device) => device.kind === 'videoinput')
        let stream: MediaStream | undefined
        if (hasVideoInput) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              // audio: true,
              video: true
            })
          } catch (error) {
            const errorName = (error as DOMException)?.name
            if (
              errorName === 'NotFoundError' ||
              errorName === 'OverconstrainedError' ||
              errorName === 'NotAllowedError'
            ) {
              console.warn('Local media unavailable, continue in receive-only mode', error)
            } else {
              throw error
            }
          }
        } else {
          console.warn('No video input device found, continue in receive-only mode')
        }

        if (stream) {
          callCtx.localStream = stream
          callCtx.pushLog('local_stream_ready', {
            tracks: stream.getTracks().map((track) => track.kind)
          })
          console.log('thanhduy - joinRoom 3')

          for (const track of stream.getTracks()) {
            pc.addTrack(track, stream)
          }
        } else {
          // Keep the PC negotiable even without local camera/mic.
          callCtx.pushLog('local_stream_missing_use_recvonly')
          pc.addTransceiver('video', { direction: 'recvonly' })
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        console.log('thanhduy - joinRoom 4')

        sdpOffer = offer.sdp!
      } else {
        sdpOffer = await registerWebRTCIce(ICE_SERVERS)
      }

      const tracks = extractMidTrackArray(sdpOffer)
      const validTracks = tracks.filter((t) => Boolean(t.trackName))

      const initialTracks: ReqTrack[] = validTracks.map((t, i) => ({
        trackName: t.trackName,
        mid: t.mid,
        streamNumber: i, //must be number
        location: 'local',
        isPublished: true,
        roomId: roomId,
        sessionId: sessionId
      }))
      callCtx.tracks = initialTracks

      console.log('thanhduy - joinRoom 5')

      await this.blockchain.meeting.joinRoom({
        from: input.address,
        inputData: {
          _sdpOffer: sdpOffer,
          requestId: randomBytes32(),
          roomId: roomId,
          _initialTracks: initialTracks,
          sessionId
        }
      })
      callCtx.joinState = 'joined'
      callCtx.pushLog('join_room_done', { roomId, sessionId, tracks: callCtx.tracks.length })
      console.log('thanhduy - joinRoom 6')
      return { sessionId, sdpOffer }
    } catch (error) {
      callCtx.pushLog('join_room_error', {
        message: error instanceof Error ? error.message : String(error)
      })
      callCtx.cleanupPeerState()
      throw error
    }
  }

  async getViewInput() {
    return (await queryClient.getQueryData(queryKeys.viewInput)) as Required<MeetingViewInput>
  }

  async emitSdpAnswerToBackend(input: MeetingViewInput, sdp_answer: string, sessionId?: string) {
    const sdpAnswerData: ReqSdpAnswer = {
      ToUser: input.address,
      AnswerSDP: sdp_answer
    }

    const targetSessionId = sessionId ?? input.sessionId
    if (!targetSessionId) {
      throw new Error('Missing session id for SDP_ANSWER')
    }

    await this.blockchain.meeting.emitEventToBackend({
      from: input.address,
      inputData: {
        _eventType: 'SDP_ANSWER',
        _roomId: input.roomId!,
        _sessionId: targetSessionId,
        _data: encodeDataToBackend(sdpAnswerData)
      }
    })
    callCtx.pushLog('emit_sdp_answer_done', {
      roomId: input.roomId,
      sessionId: targetSessionId
    })
  }

  async connectLocal(sdp_answer: string, sessionId?: string) {
    const input = await this.getViewInput()
    if (!input) return
    const targetSessionId = sessionId ?? input.sessionId
    if (!targetSessionId) {
      throw new Error('Missing session id for JOIN_ANSWER flow')
    }
    callCtx.publisherSessionId = targetSessionId
    callCtx.pc
    if (window.finSdk) {
      await callCtx.pc.setRemoteDescription({ type: 'answer', sdp: sdp_answer })
    } else {
      await setAnswerSDP(sdp_answer)
    }
    callCtx.pushLog('connect_local_set_answer_done', { sessionId: targetSessionId })
    console.log('thanhduy - connect local sdp_answer', sdp_answer)
    await this.emitSdpAnswerToBackend(input, sdp_answer, sessionId)

    const addTrackData: ReqAddTrack = {
      Track: callCtx.tracks
    }

    await this.blockchain.meeting.emitEventToBackend({
      from: input.address,
      inputData: {
        _eventType: 'ADD_TRACK',
        _roomId: input.roomId,
        _sessionId: targetSessionId,
        _data: encodeDataToBackend(addTrackData)
      }
    })
    callCtx.pushLog('emit_add_track_done', {
      roomId: input.roomId,
      sessionId: targetSessionId,
      tracks: callCtx.tracks.length
    })
  }

  async connectRemote(sdp_offer: string, sessionId?: string) {
    const input = await this.getViewInput()
    if (!input) return
    const targetSessionId = sessionId ?? input.sessionId
    const shouldUsePublisherPc =
      !!targetSessionId &&
      !!callCtx.publisherSessionId &&
      targetSessionId.toLowerCase() === callCtx.publisherSessionId.toLowerCase()
    callCtx.pushLog('connect_remote_start', {
      sessionId: targetSessionId,
      usePc: shouldUsePublisherPc ? 'publisher_pc' : 'remote_pc'
    })
    console.log('thanhduy - connectRemote 1', sdp_offer)
    let sdpAnswer = ''
    if (window.finSdk) {
      console.log('thanhduy - connectRemote 1.5')

      const pc = shouldUsePublisherPc ? callCtx.pc : callCtx.remotePc
      if (!shouldUsePublisherPc && targetSessionId) {
        callCtx.subscriberSessionId = targetSessionId
      }
      // pc.addTransceiver('video', { direction: 'recvonly' })
      // pc.addTransceiver('audio', { direction: 'recvonly' })
      await pc.setRemoteDescription({ type: 'offer', sdp: sdp_offer })
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      sdpAnswer = answer.sdp!
    } else {
      sdpAnswer = await setOfferSDP(sdp_offer, ICE_SERVERS)
    }
    console.log('thanhduy - connectRemote 2', sdpAnswer)

    await this.emitSdpAnswerToBackend(input, sdpAnswer, targetSessionId)
    callCtx.pushLog('connect_remote_done', {
      sessionId: targetSessionId,
      usePc: shouldUsePublisherPc ? 'publisher_pc' : 'remote_pc'
    })
    console.log('thanhduy - connectRemote 3', sdpAnswer)
  }
}
