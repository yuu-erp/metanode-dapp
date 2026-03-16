import meetFactory from './meeting-contract.json'

export const meetingAbi = {
  createRoom: meetFactory.find((item) => item.name === 'createRoom'),
  joinRoom: meetFactory.find((item) => item.name === 'joinRoom'),
  addTrack: meetFactory.find((item) => item.name === 'addTrack'),
  RoomCreateRequested: meetFactory.find((item) => item.name === 'RoomCreateRequested'),
  FrontendEvent: meetFactory.find((item) => item.name === 'FrontendEvent'),
  emitEventToBackend: meetFactory.find((item) => item.name === 'emitEventToBackend'),
  leaveRoom: meetFactory.find((item) => item.name === 'leaveRoom')
}

export { meetFactory }
