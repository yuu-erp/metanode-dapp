import { CONTRACT_ADDRESSES } from '@/config'
import { MtnContract } from '@metanodejs/mtn-contract'
import { meetingAbi } from './abis'
import type { ReqEmitEventToBackend, ReqJoinRoom, TransactionPayload } from '../types'

export class MeetingContract extends MtnContract {
  constructor() {
    super({ to: CONTRACT_ADDRESSES.meeting })
  }

  createRoom(
    payload: TransactionPayload<{
      requestId: string
      _receiver: string
      roomName: string
      meet: boolean
    }>
  ): Promise<{}> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      functionName: 'createRoom',
      abiData: meetingAbi.createRoom as any,
      inputData,
      feeType: 'sc'
    })
  }

  joinRoom(payload: TransactionPayload<ReqJoinRoom>): Promise<any> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      functionName: 'joinRoom',
      abiData: meetingAbi.joinRoom as any,
      inputData,
      feeType: 'sc'
    })
  }

  emitEventToBackend(payload: TransactionPayload<ReqEmitEventToBackend>): Promise<any> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      functionName: 'emitEventToBackend',
      abiData: meetingAbi.emitEventToBackend as any,
      inputData,
      feeType: 'sc'
    })
  }
}
