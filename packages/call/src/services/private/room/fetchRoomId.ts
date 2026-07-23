import { blockchain, waitEventLog } from '~/clients'
import { roomActions, roomStore } from '~/stores'
export async function fetchRoomId() {
  console.log('[DEBUG] fetchRoomId 1', roomStore.getState())
  const { roomId, isCaller, callee, isMeet, address, hiddenAddress } = roomStore.getState()
  if (roomId) return roomId

  if (!isCaller) throw new Error('Invalid room id for participant role')

  const promise = waitEventLog('RoomCreateRequested', (e) => {
    console.log('[DEBUG] fetchRoomId 1.1', { e, hiddenAddress })

    return roomActions.isMyAddress(e.requester)
  })
  console.log('[DEBUG] fetchRoomId 2')

  await blockchain.createRoom({
    _receiver: callee,
    meet: isMeet,
    roomName: `Room-${address}`,
    isLockRoom: callee === '0x',
    owner: address
  })
  console.log('[DEBUG] fetchRoomId 3')

  const _roomId = (await promise).roomId
  console.log('[DEBUG] fetchRoomId 4', _roomId)

  roomStore.setState({ roomId: _roomId })

  return _roomId
}
