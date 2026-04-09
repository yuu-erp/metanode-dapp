import { blockchain, waitEventLog } from '~/clients'
import { roomActions, roomStore } from '~/stores'

export async function fetchRoomId() {
  console.log('thanhduy - fetchRoomId 1')
  const { roomId, isCaller, callee, isMeet, address } = roomStore.getState()
  if (roomId) return roomId
  console.log('thanhduy - fetchRoomId 2')

  if (!isCaller) throw new Error('Invalid room id for participant role')
  console.log('thanhduy - fetchRoomId 3')

  const promise = waitEventLog('RoomCreateRequested', (e) => roomActions.isMyAddress(e.requester))

  await blockchain.createRoom({
    _receiver: callee,
    meet: isMeet,
    roomName: `Room-${address}`,
    isLockRoom: callee === '0x',
    owner: address
  })
  console.log('thanhduy - fetchRoomId 5')

  const _roomId = (await promise).roomId
  console.log('thanhduy - fetchRoomId 6')

  roomStore.setState({ roomId: _roomId })
  console.log('thanhduy - fetchRoomId 7')

  return _roomId
}
