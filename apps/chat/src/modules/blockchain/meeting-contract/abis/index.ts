import meetingContract from './meeting-contract.json'

export const meetingAbi = {
  createRoom: meetingContract.find((item) => item.name === 'createRoom'),
  joinRoom: meetingContract.find((item) => item.name === 'joinRoom'),
  addTrack: meetingContract.find((item) => item.name === 'addTrack'),
  RoomCreateRequested: meetingContract.find((item) => item.name === 'RoomCreateRequested'),
  FrontendEvent: meetingContract.find((item) => item.name === 'FrontendEvent'),
  emitEventToBackend: meetingContract.find((item) => item.name === 'emitEventToBackend'),
  leaveRoom: meetingContract.find((item) => item.name === 'leaveRoom'),
  rejectCall: meetingContract.find((item) => item.name === 'rejectCall'),
  getRoomParticipants: meetingContract.find((item) => item.name === 'getRoomParticipants'),
  rooms: meetingContract.find((item) => item.name === 'rooms'),
  sendCallReaction: meetingContract.find((item) => item.name === 'sendCallReaction'),
  approveParticipant: meetingContract.find((item) => item.name === 'approveParticipant'),
  rejectParticipant: meetingContract.find((item) => item.name === 'rejectParticipant'),
  handleRaiseHand: meetingContract.find((item) => item.name === 'handleRaiseHand'),
  getRoomParticipantOwner: meetingContract.find((item) => item.name === 'getRoomParticipantOwner'),
  toggleCamera: meetingContract.find((item) => item.name === 'toggleCamera')
}

export { meetingContract }
