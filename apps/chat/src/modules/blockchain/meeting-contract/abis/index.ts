import meetingContract from './meeting-contract.json'

export const meetingAbi = {
  createRoom: meetingContract.find((item) => item.name === 'createRoom'),
  joinRoom: meetingContract.find((item) => item.name === 'joinRoom'),
  addTrack: meetingContract.find((item) => item.name === 'addTrack'),
  RoomCreateRequested: meetingContract.find((item) => item.name === 'RoomCreateRequested'),
  FrontendEvent: meetingContract.find((item) => item.name === 'FrontendEvent'),
  emitEventToBackend: meetingContract.find((item) => item.name === 'emitEventToBackend'),
  leaveRoom: meetingContract.find((item) => item.name === 'leaveRoom'),
  rejectCall: meetingContract.find((item) => item.name === 'rejectCall')
}

export { meetingContract }
