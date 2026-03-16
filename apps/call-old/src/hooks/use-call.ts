import { blockchain, callContext, eventBus, eventLog, ICE_SERVERS, useCallStore } from '@/modules'
import { compareAddress } from '@/shared'
import { registerWebRTCIce } from '@metanodejs/system-core'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { v4 } from 'uuid'

export function useCall() {
  const navigate = useNavigate()

  const waitCreateRoom = () => {
    return new Promise<{
      roomId: string
      requestId: string
    }>(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        off()
        reject(new Error('Create call timeout'))
      }, 15000)

      const off = eventLog.eventLog.on('RoomCreateRequested', async (event) => {
        console.log('RoomCreateRequested', event)

        if (compareAddress(event.requester, callContext.address)) {
          clearTimeout(timeout)
          off() // Stop listening
          resolve({
            roomId: event.roomId,
            requestId: event.requestId
          })
        }
      })
    })
  }

  const getStream = async (pc: RTCPeerConnection) => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const hasVideoInput = devices.some((device) => device.kind === 'videoinput')
    let stream: MediaStream | undefined

    if (hasVideoInput) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
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
      console.log('thanhduy - joinRoom 3')

      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream)
      }
    } else {
      // Keep the PC negotiable even without local camera/mic.
      pc.addTransceiver('video', { direction: 'recvonly' })
    }
    useCallStore.setState({ localStream: stream })
  }

  const getSdpOffer = async (pc: RTCPeerConnection) => {
    let sdpOffer = ''
    if (window.finSdk) {
      await getStream(pc)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      sdpOffer = offer.sdp!
    } else {
      sdpOffer = await registerWebRTCIce(ICE_SERVERS)
    }
    return sdpOffer
  }

  function extractMidTrackArray(sdp: string): {
    trackName: string
    mid: string
  }[] {
    const sections = sdp.split('\nm=') // tách theo từng media section
    const result: { mid: string; trackName: string }[] = []

    sections.forEach((section) => {
      const midMatch = section.match(/a=mid:(\S+)/)
      const msidMatch = section.match(/a=msid:[^\s]+\s+([^\s]+)/)

      if (midMatch) {
        result.push({
          mid: midMatch[1],
          trackName: msidMatch ? msidMatch[1] : '' // nếu không có msid thì để rỗng
        })
      }
    })

    return result
  }

  const getTracks = async (sdpOffer: string) => {
    const tracks = extractMidTrackArray(sdpOffer)
    const validTracks = tracks.filter((t) => Boolean(t.trackName))
    const initialTracks: ReqTrack[] = validTracks.map((t, i) => ({
      trackName: t.trackName,
      mid: t.mid,
      streamNumber: i, //must be number
      location: 'local',
      isPublished: true,
      roomId: callContext.roomId,
      sessionId: callContext.sessionId
    }))
    callContext.setState({ localTracks: initialTracks })

    return initialTracks
  }

  return useQuery({
    retry: 0,
    queryKey: ['use-call'],
    queryFn: async () => {
      const { isCaller, address, callee, isMeet } = callContext
      if (isCaller && !callContext.roomId) {
        const promise = waitCreateRoom()

        await blockchain.meeting.createRoom({
          from: address,
          inputData: {
            _receiver: callee,
            meet: isMeet,
            roomName: `Room-${address}`
          }
        })

        const rs = await promise
        callContext.setState({ roomId: rs.roomId })

        // update roomId len query để khi reload vẫn ở room đấy
        navigate({
          search: ((prev: any) => ({
            ...prev,
            roomId: rs.roomId
          })) as any,
          replace: true
        })
      }
      useCallStore.setState({ loadingStatus: 'start get sdp offer...' })
      callContext.setState({ sessionId: v4() })
      const { roomId, localPc } = callContext
      const sdpOffer = await getSdpOffer(localPc)
      const tracks = await getTracks(sdpOffer)
      eventBus.emit('connect-local', 'start join room')
      useCallStore.setState({ loadingStatus: 'start join room...' })

      await blockchain.meeting.joinRoom({
        from: address,
        inputData: {
          _sdpOffer: sdpOffer,
          roomId: roomId,
          _initialTracks: tracks
        }
      })
      eventBus.emit('connect-local', 'join room success')
      useCallStore.setState({ loadingStatus: 'Finish join room...' })

      return true
    }
  })
}
