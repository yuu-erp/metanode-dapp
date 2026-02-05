import { MtnContract } from '@metanodejs/mtn-contract'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import type { TransactionPayload } from '../types'
import { meetFactoryAbi } from './abis'
import type {
  CreateRoomInput,
  EmitEventToBackendInput,
  JoinRoomInput,
  LeaveRoomInput
} from './types'

export class MettingContract extends MtnContract {
  constructor() {
    super({ to: CONTRACT_ADDRESSES.meeting })
  }

  createRoom(payload: TransactionPayload<CreateRoomInput>): Promise<string> {
    const { from, inputData } = payload
    if (!inputData) throw new Error('Input data is required')
    return this.sendTransaction({
      from,
      functionName: 'createRoom',
      abiData: meetFactoryAbi.createRoom as any,
      inputData: {
        _name: inputData.name,
        _receiver: inputData.receiver,
        meet: inputData.meet
      },
      feeType: 'sc'
    })
  }

  joinRoom(payload: TransactionPayload<JoinRoomInput>): Promise<void> {
    const { from, inputData } = payload
    if (!inputData) throw new Error('Input data is required')
    return this.sendTransaction({
      from,
      functionName: 'joinRoom',
      abiData: meetFactoryAbi.joinRoom as any,
      inputData,
      feeType: 'sc'
    })
  }

  emitEventToBackend(payload: TransactionPayload<EmitEventToBackendInput>): Promise<void> {
    const { from, inputData } = payload
    if (!inputData) throw new Error('Input data is required')
    return this.sendTransaction({
      from,
      functionName: 'emitEventToBackend',
      abiData: meetFactoryAbi.emitEventToBackend as any,
      inputData: {
        _roomId: inputData.roomId,
        _sessionId: inputData.sessionId,
        _eventType: inputData.eventType,
        _data: inputData.data
      },
      feeType: 'sc'
    })
  }

  leaveRoom(payload: TransactionPayload<LeaveRoomInput>): Promise<void> {
    const { from, inputData } = payload
    if (!inputData) throw new Error('Input data is required')
    return this.sendTransaction({
      from,
      functionName: 'leaveRoom',
      abiData: meetFactoryAbi.leaveRoom as any,
      inputData: {
        _roomId: inputData.roomId,
        _sessionId: inputData.sessionId,
        otherParty: inputData.otherParty,
        end: inputData.end,
        sender: inputData.sender
      },
      feeType: 'sc'
    })
  }
}
