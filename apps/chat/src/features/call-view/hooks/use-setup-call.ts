import { container } from '@/container'
import { registerWebRTCIce } from '@metanodejs/system-core'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { callActions, callStore } from '../../../modules/call/call.store'
import {
  compareAddress,
  createPeerConnection,
  extractMidTrackArray,
  ICE_SERVERS
} from '../../../modules/call/lib'
import type { ReqTrack } from '../../../modules/call/types'

const eventLog = container.eventLogContainer.eventLog
const contract = container.meetingContract
const eventBus = container.eventBus

export function useSetupCall() {
  const navigate = useNavigate()
  const isOnline = useRef(true)

  //create room
  const handleCreateRoom = async () => {
    const { isCaller, roomId, address, isMeet, callee } = callStore.getState()
    if (!isCaller || !!roomId) return
    const promise = waitCreateRoom()
    callActions.setMessage('Start create room...')
    await contract.createRoom({
      from: address,
      inputData: {
        _receiver: callee,
        meet: isMeet,
        roomName: `Room-${address}`
      }
    })
    callActions.setMessage('Waiting create room event...')

    const data = await promise
    callActions.setMessage('Finish create room...')
    callStore.setState({ roomId: data.roomId })

    navigate({
      search: ((prev: any) => ({
        ...prev,
        roomId: data.roomId
      })) as any,
      replace: true
    })
  }

  function waitCreateRoom() {
    return new Promise<{
      roomId: string
      requestId: string
    }>(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        off()
        reject(new Error('Create call timeout'))
      }, 15000)

      const off = eventLog.on('RoomCreateRequested', async (event) => {
        if (compareAddress(event.requester, callStore.getState().address)) {
          clearTimeout(timeout)
          off()
          resolve({
            roomId: event.roomId,
            requestId: event.requestId
          })
        }
      })
    })
  }

  //connect pc for web

  async function addVideo(pc: RTCPeerConnection, stream: MediaStream) {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
      videoStream.getTracks().forEach((track) => {
        const cb = () => callActions.updateMediaPermissionState('video')
        track.addEventListener('mute', cb)
        track.addEventListener('ended', cb)
        callActions.addCleanupFunction(() => track.removeEventListener('mute', cb))
        callActions.addCleanupFunction(() => track.removeEventListener('ended', cb))
        pc.addTrack(track, videoStream)
        stream.addTrack(track)
      })
      callActions.updateMedia('video', { on: true })
    } catch (error) {
      callActions.updateMedia('video', { on: false })
      pc.addTransceiver('video', { direction: 'recvonly' })
    }
  }

  async function addAudio(pc: RTCPeerConnection, stream: MediaStream) {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })
      audioStream.getTracks().forEach((track) => {
        const cb = () => callActions.updateMediaPermissionState('audio')
        track.addEventListener('mute', cb)
        track.addEventListener('ended', cb)
        callActions.addCleanupFunction(() => track.removeEventListener('mute', cb))
        callActions.addCleanupFunction(() => track.removeEventListener('ended', cb))
        pc.addTrack(track, audioStream)
        stream.addTrack(track)
      })
      callActions.updateMedia('audio', { on: true })
    } catch (error) {
      callActions.updateMedia('audio', { on: false })
      pc.addTransceiver('audio', { direction: 'recvonly' })
    }
  }

  async function addTrackToPc(pc: RTCPeerConnection) {
    const stream = new MediaStream()
    await Promise.all([addVideo(pc, stream), addAudio(pc, stream)])
    callStore.setState({ localStream: stream })
  }

  async function getWebSdpOffer() {
    if (!window.finSdk) throw new Error('[getWebSdpOffer]: Invalid window finsdk')
    let localPc = callStore.getState().localPc
    if (!localPc) {
      localPc = createPeerConnection()
      callStore.setState({ localPc })
    }
    await Promise.all([
      callActions.getExistMedia(),
      callActions.updateMediaPermissionState('audio'),
      callActions.updateMediaPermissionState('video')
    ])
    await addTrackToPc(localPc)
    const offer = await localPc.createOffer()
    await localPc.setLocalDescription(offer)
    return offer.sdp!
  }

  //get track from offer
  const getTracks = (sdpOffer: string) => {
    const { roomId, sessionId } = callStore.getState()

    const tracks = extractMidTrackArray(sdpOffer)
    const validTracks = tracks.filter((t) => Boolean(t.trackName))

    const initialTracks: ReqTrack[] = validTracks.map((t, i) => ({
      trackName: t.trackName + Date.now(),
      mid: t.mid,
      streamNumber: i,
      location: 'local',
      isPublished: true,
      roomId: roomId,
      sessionId: sessionId
    }))
    callStore.setState({ localTracks: initialTracks })
    return initialTracks
  }

  //join room
  async function handleJoinRoom(sdpOffer: string, tracks: ReqTrack[]) {
    const { hiddenAddress, roomId } = callStore.getState()
    await contract.joinRoom({
      from: hiddenAddress,
      inputData: {
        _sdpOffer: sdpOffer,
        roomId: roomId,
        _initialTracks: tracks
      }
    })
  }

  const setupCall = async () => {
    try {
      callStore.setState({ joinLoading: true })
      await handleCreateRoom()
      callActions.setMessage('Start get local sdp offer...')
      const sdpOffer = window.finSdk ? await getWebSdpOffer() : await registerWebRTCIce(ICE_SERVERS)
      const tracks = getTracks(sdpOffer)
      callActions.setMessage('Finish get local sdp offer...')
      await handleJoinRoom(sdpOffer, tracks)
    } catch (error) {
      console.log('[setupCall] error: ', error)
    } finally {
      callStore.setState({ joinLoading: false })
    }
  }

  const reconnect = async () => {
    console.log('thanhduy - reconnect 1')
    const loading = callStore.getState().joinLoading
    if (loading) return
    console.log('thanhduy - reconnect 2')

    callActions.cleanupMedia()
    await setupCall()
  }

  useEffect(() => {
    reconnect()

    return () => {
      callActions.cleanupMedia()
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const { roomId, hiddenAddress } = callStore.getState()
      if (!roomId) return
      const participants = await contract.getRoomParticipants({
        from: hiddenAddress,
        inputData: {
          roomId
        }
      })
      if (participants.length < 2) eventBus.emit('call.end', null)
    }, 60_000)

    const id = setInterval(() => {
      const nowIsOnline = navigator.onLine
      if (isOnline.current && !nowIsOnline) {
        clearTimeout(timeoutId)
      }

      if (!isOnline.current && nowIsOnline) {
        window.location.reload()
      }
      isOnline.current = nowIsOnline
    }, 5000)

    return () => {
      clearInterval(id)
      clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('online', () => {
      console.log('thanhduy online ne')
    })
  }, [])
}
