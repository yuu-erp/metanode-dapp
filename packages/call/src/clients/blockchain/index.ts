import { ContractClient, ContractTransport } from './core'
import { SystemCore } from '@metanodejs/system-core'
import meetingAbi from './meeting.abi.json'
import {
  CreateRoomRequest,
  EmitEventToBackendRequest,
  HandleRaiseHandRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  ParticipantActionRequest,
  RejectCallRequest,
  SendCallReactionRequest,
  WithRoomId
} from './types'
import { makePiority } from '../async-piority'

function createBlockchainFactory() {
  const transport = new ContractTransport()

  const meetingClient = new ContractClient(transport, meetingAbi)

  const setFrom = (address: string) => {
    meetingClient.from = address
  }

  const setTo = (address: string) => {
    meetingClient.to = address
  }

  return {
    setFrom,
    setTo,
    createRoom: makePiority(meetingClient.make<CreateRoomRequest, void>('createRoom'), 'high'),
    joinRoom: makePiority(meetingClient.make<JoinRoomRequest, void>('joinRoom'), 'high'),
    emitEventToBackend: makePiority(
      meetingClient.make<EmitEventToBackendRequest, void>('emitEventToBackend'),
      'low'
    ),
    startScreenShare: makePiority(meetingClient.make<WithRoomId, void>('startScreenShare'), 'low'),
    stopScreenShare: makePiority(meetingClient.make<WithRoomId, void>('stopScreenShare'), 'low'),
    rejectCall: makePiority(meetingClient.make<RejectCallRequest, void>('rejectCall'), 'low'),
    leaveRoom: makePiority(meetingClient.make<LeaveRoomRequest, void>('leaveRoom'), 'high'),
    sendCallReaction: makePiority(
      meetingClient.make<SendCallReactionRequest, void>('sendCallReaction'),
      'low'
    ),
    handleRaiseHand: makePiority(
      meetingClient.make<HandleRaiseHandRequest, void>('handleRaiseHand'),
      'low'
    ),
    approveParticipant: makePiority(
      meetingClient.make<ParticipantActionRequest, void>('approveParticipant'),
      'low'
    ),
    rejectParticipant: makePiority(
      meetingClient.make<ParticipantActionRequest, void>('rejectParticipant'),
      'low'
    ),
    getRoomParticipants: meetingClient.make<WithRoomId, string[]>('getRoomParticipants')
  }
}

const blockchain = createBlockchainFactory()

export { blockchain, meetingAbi }
export * from './types'
