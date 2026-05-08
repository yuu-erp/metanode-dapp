import { blockchain, waitEventLog } from '~/clients'
import { roomActions, roomStore } from '~/stores'

export async function fetchRoomId() {
  const { roomId, isCaller, callee, isMeet, address } = roomStore.getState()
  if (roomId) return roomId

  if (!isCaller) throw new Error('Invalid room id for participant role')

  const promise = waitEventLog('RoomCreateRequested', (e) => roomActions.isMyAddress(e.requester))

  await blockchain.createRoom({
    _receiver: callee,
    meet: isMeet,
    roomName: `Room-${address}`,
    isLockRoom: callee === '0x',
    owner: address
  })

  const _roomId = (await promise).roomId

  roomStore.setState({ roomId: _roomId })

  return _roomId
}
