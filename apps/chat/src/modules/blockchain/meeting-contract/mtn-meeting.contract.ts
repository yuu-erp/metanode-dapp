import { CONTRACT_ADDRESSES } from '@/config'
import { MtnContract } from '@metanodejs/mtn-contract'
import { meetingAbi } from './abis'
import type { TransactionPayload } from '../types'
import { asyncPriorityQueue } from '@/modules/realtime'

export type ReqTrack = {
  trackName: string
  mid: any
  location: string
  streamNumber: number
  isPublished: boolean
  roomId: string
}

export type ReqJoinRoom = {
  roomId: string
  _sdpOffer: string
  _initialTracks: ReqTrack[]
}

export type ReqEmitEventToBackend = {
  _roomId: string
  _sessionId: string
  _eventType: string
  _data: string
}

export type ReqLeaveRoom = {
  requestId: string
  roomId: string
  sessionId: string
  otherParty: string
  end: boolean
}

export type ReqRejectCall = {
  _caller: string
  _roomId: string
}

export class MeetingContract extends MtnContract {
  constructor() {
    super({ to: CONTRACT_ADDRESSES.meeting })
  }

  createRoom(
    payload: TransactionPayload<{
      _receiver: string
      roomName: string
      meet: boolean
    }>
  ): Promise<{}> {
    const { from, inputData } = payload
    return asyncPriorityQueue.add(
      () =>
        this.sendTransaction({
          from,
          functionName: 'createRoom',
          abiData: meetingAbi.createRoom as any,
          inputData,
          feeType: 'sc'
        }),
      'high'
    )
  }

  joinRoom(payload: TransactionPayload<ReqJoinRoom>): Promise<any> {
    const { from, inputData } = payload
    return asyncPriorityQueue.add(
      () =>
        this.sendTransaction({
          from,
          functionName: 'joinRoom',
          abiData: meetingAbi.joinRoom as any,
          inputData,
          feeType: 'sc'
        }),
      'high'
    )
  }

  emitEventToBackend(payload: TransactionPayload<ReqEmitEventToBackend>): Promise<any> {
    const { from, inputData } = payload
    return asyncPriorityQueue.add(
      () =>
        this.sendTransaction({
          from,
          functionName: 'emitEventToBackend',
          abiData: meetingAbi.emitEventToBackend as any,
          inputData,
          feeType: 'sc'
        }),
      'low'
    )
  }

  leaveRoom(payload: TransactionPayload<ReqLeaveRoom>): Promise<any> {
    const { from, inputData } = payload
    return asyncPriorityQueue.add(
      () =>
        this.sendTransaction({
          from,
          functionName: 'leaveRoom',
          abiData: meetingAbi.leaveRoom as any,
          inputData,
          feeType: 'sc'
        }),
      'high'
    )
  }

  rejectCall(payload: TransactionPayload<ReqRejectCall>): Promise<void> {
    const { from, inputData } = payload
    return asyncPriorityQueue.add(
      () =>
        this.sendTransaction({
          from,
          functionName: 'rejectCall',
          abiData: meetingAbi.rejectCall as any,
          inputData,
          feeType: 'sc'
        }),
      'high'
    )
  }
}
