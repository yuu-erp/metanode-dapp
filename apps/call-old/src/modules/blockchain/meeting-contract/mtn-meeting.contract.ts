import { CONTRACT_ADDRESSES } from '@/config'
import { MtnContract } from '@metanodejs/mtn-contract'
import { meetingAbi } from './abis'
import type { ReqEmitEventToBackend, ReqJoinRoom, ReqLeaveRoom, TransactionPayload } from '../types'
import { asyncPriorityQueue } from '@/modules/realtime'

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
}
