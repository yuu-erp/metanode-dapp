import { CONTRACT_ADDRESSES } from '@/config'
import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { ConversationType } from '@/modules/conversation'
import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
import { compareAddress } from '@/shared/lib'
import { formatAddress } from '@/shared/utils'
import { applyPureChatIdentity } from './apply-pure-chat-identity'
import { buildPureAccount } from './build-pure-account'
import { isValidEthAddress, normalizeEthAddress } from './wallet-identity'

async function accountFromIdentity(identityInput: string) {
  const { contract } = await applyPureChatIdentity(identityInput)
  const account = await buildPureAccount(contract.walletAddress, contract.contractAddress)
  return { account, contract }
}

function parseAddress(value: string, label: string) {
  const v = value.trim()
  if (!isValidEthAddress(v)) throw new Error(`${label} không hợp lệ`)
  return normalizeEthAddress(v)
}

export async function pureMeetingFactoryStatus(identityInput: string, sync = false) {
  const { account, contract } = await accountFromIdentity(identityInput)
  const envFactory = CONTRACT_ADDRESSES.meeting

  const onUser = await container.userContract.meetingFactoryAddress({
    from: account.address,
    to: contract.contractAddress,
  })

  const result: Record<string, unknown> = {
    walletAddress: account.address,
    userContract: contract.contractAddress,
    meetingFactoryOnUser: onUser,
    meetingFactoryEnv: envFactory,
    matched: compareAddress(onUser, envFactory),
  }

  if (sync && !compareAddress(onUser, envFactory)) {
    await container.userContract.setMeetingFactory({
      from: account.address,
      to: contract.contractAddress,
      inputData: { _newMeetingFactoryAddress: envFactory },
    })
    const after = await container.userContract.meetingFactoryAddress({
      from: account.address,
      to: contract.contractAddress,
    })
    result.synced = true
    result.meetingFactoryOnUser = after
    result.matched = compareAddress(after, envFactory)
  }

  return result
}

export async function fetchMeetingRoomSnapshot(account: Account, roomId: string) {
  const from = account.hiddenAddress
  const normalizedRoom = parseAddress(roomId, 'roomId')
  const [room, participants, owner] = await Promise.all([
    container.meetingContract.rooms({ from, inputData: { '': normalizedRoom } }),
    container.meetingContract.getRoomParticipants({ from, inputData: { roomId: normalizedRoom } }),
    container.meetingContract.getRoomParticipantOwner({
      from,
      inputData: { roomId: normalizedRoom },
    }),
  ])
  return {
    roomId: normalizedRoom,
    room,
    participants,
    participantOwner: owner,
  }
}

export async function pureCreateMeetingRoom(options: {
  identityInput: string
  receiver: string
  roomName?: string
  isMeet: boolean
  isLockRoom?: boolean
}) {
  const { account } = await accountFromIdentity(options.identityInput)
  const receiver = parseAddress(options.receiver, 'receiver / callee')
  const roomName = (options.roomName?.trim() || `Room-${account.address.slice(2, 8)}`).slice(0, 120)

  const eventPromise = new Promise<{
    roomId: string
    requester: string
    roomName: string
    meet: string
  }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      off()
      reject(new Error('Timeout đợi RoomCreateRequested (30s)'))
    }, 30_000)
    const off = container.eventLogContainer.eventLog.on('RoomCreateRequested', (event) => {
      if (!compareAddress(event.requester, account.address)) return
      clearTimeout(timeout)
      off()
      resolve({
        roomId: formatAddress(event.roomId),
        requester: event.requester,
        roomName: event.roomName,
        meet: event.meet,
      })
    })
  })

  await container.meetingContract.createRoom({
    from: account.hiddenAddress,
    inputData: {
      _receiver: receiver,
      roomName,
      meet: options.isMeet,
      isLockRoom: options.isLockRoom ?? receiver === '0x0000000000000000000000000000000000000000',
      owner: account.address,
    },
  })

  const created = await eventPromise
  const snapshot = await fetchMeetingRoomSnapshot(account, created.roomId)

  const meetingView: MeetingViewInput = {
    address: account.address,
    caller: account.address,
    callee: receiver,
    isCaller: true,
    isMeet: options.isMeet,
    roomId: created.roomId,
    conversationType: options.isMeet ? 'group' : 'p2p',
  }

  return {
    created,
    meetingView,
    openCallSearch: new URLSearchParams(
      meetingView as unknown as Record<string, string>,
    ).toString(),
    snapshot,
  }
}

export async function pureMeetingRoomInfo(identityInput: string, roomId: string) {
  const { account } = await accountFromIdentity(identityInput)
  return fetchMeetingRoomSnapshot(account, roomId)
}

export function buildMeetingViewInput(options: {
  account: Account
  callee: string
  conversationType: ConversationType
  roomId?: string
  isCaller?: boolean
}): MeetingViewInput {
  const isMeet = options.conversationType !== 'p2p'
  return {
    address: options.account.address,
    caller: options.account.address,
    callee: parseAddress(options.callee, 'callee'),
    isCaller: options.isCaller ?? true,
    isMeet,
    roomId: options.roomId?.trim() ? parseAddress(options.roomId, 'roomId') : undefined,
    conversationType: options.conversationType,
  }
}

export async function pureBuildCallLaunchParams(options: {
  identityInput: string
  callee: string
  conversationType: ConversationType
  roomId?: string
}) {
  const { account } = await accountFromIdentity(options.identityInput)
  const meetingView = buildMeetingViewInput({
    account,
    callee: options.callee,
    conversationType: options.conversationType,
    roomId: options.roomId,
  })
  return {
    meetingView,
    openInAppPath: `/call?${new URLSearchParams(meetingView as unknown as Record<string, string>).toString()}`,
    setupMeetingPath: meetingView.roomId
      ? `/setup-meeting?${new URLSearchParams({
          caller: meetingView.caller,
          roomId: meetingView.roomId,
        }).toString()}`
      : undefined,
    note: 'Giống useGoToMeetingView — WebRTC chạy ở route /call hoặc native startCallRTC',
  }
}

export async function pureRejectCall(options: {
  identityInput: string
  roomId: string
  caller: string
}) {
  const { account } = await accountFromIdentity(options.identityInput)
  const roomId = parseAddress(options.roomId, 'roomId')
  const caller = parseAddress(options.caller, 'caller')

  await container.meetingContract.rejectCall({
    from: account.hiddenAddress,
    inputData: {
      _caller: caller,
      _roomId: roomId,
      owner: account.address,
    },
  })

  const snapshot = await fetchMeetingRoomSnapshot(account, roomId)
  return { rejected: { roomId, caller }, snapshot }
}
