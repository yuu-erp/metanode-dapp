import { serializeForPureLog } from '../utils/fetch-conversation-list'
import {
  pureBuildCallLaunchParams,
  pureCreateMeetingRoom,
  pureMeetingFactoryStatus,
  pureMeetingRoomInfo,
  pureRejectCall,
} from '../utils/call-meeting-pure'
import { mountPureActionForm } from '../utils/mount-pure-action-form'
import type { ConversationType } from '@/modules/conversation'

const logOk = (result: unknown) => serializeForPureLog({ ok: true, ...(result as object) })

export function mountCallMeetingFactoryDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="11"]',
    hint: 'Đọc meeting factory trên user contract vs env (`AccountService.syncByRegisterMeeting`).',
    buttonLabel: 'Kiểm tra / sync factory',
    fields: [
      { kind: 'identity' },
      { kind: 'checkbox', id: 'syncFactory', label: 'Sync setMeetingFactory nếu lệch env' },
    ],
    onSubmit: async (v) =>
      logOk(await pureMeetingFactoryStatus(v.identity, v.syncFactory === 'true')),
  })
}

export function mountCallCreateRoomDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="12"]',
    hint: 'createRoom + đợi RoomCreateRequested — in snapshot participants.',
    buttonLabel: 'Tạo room',
    fields: [
      { kind: 'identity' },
      {
        kind: 'text',
        id: 'receiver',
        label: 'Callee / receiver',
        placeholder: '0x… contract hoặc ví',
      },
      { kind: 'text', id: 'roomName', label: 'Tên room (tuỳ chọn)', placeholder: 'Room-…' },
      {
        kind: 'select',
        id: 'isMeet',
        label: 'Loại',
        options: [
          { value: 'p2p', label: 'Call P2P (meet=false)' },
          { value: 'group', label: 'Meeting nhóm (meet=true)' },
        ],
      },
    ],
    onSubmit: async (v) => {
      if (!v.receiver?.trim()) throw new Error('Cần receiver')
      return logOk(
        await pureCreateMeetingRoom({
          identityInput: v.identity,
          receiver: v.receiver,
          roomName: v.roomName,
          isMeet: v.isMeet === 'group',
        }),
      )
    },
  })
}

export function mountCallRoomInfoDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="13"]',
    hint: 'rooms + getRoomParticipants + getRoomParticipantOwner.',
    buttonLabel: 'Lấy thông tin room',
    fields: [
      { kind: 'identity' },
      { kind: 'text', id: 'roomId', label: 'Room id', placeholder: '0x…' },
    ],
    onSubmit: async (v) => {
      if (!v.roomId?.trim()) throw new Error('Cần roomId')
      return logOk(await pureMeetingRoomInfo(v.identity, v.roomId))
    },
  })
}

export function mountCallLaunchParamsDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="14"]',
    hint: 'Build MeetingViewInput — mở `/call` hoặc native (useGoToMeetingView).',
    buttonLabel: 'Tạo params call',
    fields: [
      { kind: 'identity' },
      { kind: 'text', id: 'callee', label: 'Callee (conversationId)', placeholder: '0x…' },
      {
        kind: 'select',
        id: 'conversationType',
        label: 'conversationType',
        options: [
          { value: 'p2p', label: 'p2p' },
          { value: 'group', label: 'group' },
          { value: 'anonymous_group', label: 'anonymous_group' },
        ],
      },
      { kind: 'text', id: 'roomId', label: 'roomId (tuỳ chọn)', placeholder: '0x…' },
    ],
    onSubmit: async (v) => {
      if (!v.callee?.trim()) throw new Error('Cần callee')
      return logOk(
        await pureBuildCallLaunchParams({
          identityInput: v.identity,
          callee: v.callee,
          conversationType: (v.conversationType ?? 'p2p') as ConversationType,
          roomId: v.roomId,
        }),
      )
    },
  })
}

export function mountCallRejectDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="15"]',
    hint: 'rejectCall — in snapshot room sau khi reject.',
    buttonLabel: 'Reject call',
    fields: [
      { kind: 'identity' },
      { kind: 'text', id: 'roomId', label: 'Room id', placeholder: '0x…' },
      { kind: 'text', id: 'caller', label: 'Caller', placeholder: '0x…' },
    ],
    onSubmit: async (v) => {
      if (!v.roomId?.trim() || !v.caller?.trim()) throw new Error('Cần roomId và caller')
      return logOk(
        await pureRejectCall({
          identityInput: v.identity,
          roomId: v.roomId,
          caller: v.caller,
        }),
      )
    },
  })
}
