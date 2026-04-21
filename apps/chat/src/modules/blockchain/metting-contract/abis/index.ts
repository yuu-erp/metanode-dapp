import meetFactory from './meetFactory.json'

export const meetFactoryAbi = {
  createRoom: meetFactory.find((item) => item.name === 'createRoom'),
  joinRoom: meetFactory.find((item) => item.name === 'joinRoom'),
  emitEventToBackend: meetFactory.find((item) => item.name === 'emitEventToBackend'),
  leaveRoom: meetFactory.find((item) => item.name === 'leaveRoom')
}
