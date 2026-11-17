import { serializeForPureLog } from '../utils/fetch-conversation-list'
import {
  pureAddGroupMember,
  pureCreateGroup,
  pureFetchGroupInfo,
  pureRemoveGroupMember,
  pureTransferGroupAdmin,
  randomPureGroupName,
} from '../utils/group-actions-pure'
import { mountPureActionForm } from '../utils/mount-pure-action-form'

function logResult(result: unknown) {
  return serializeForPureLog({ ok: true, ...((result as object) ?? {}) })
}

export function mountGroupCreateDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="6"]',
    hint: 'Tạo group qua factory (`conversationService.createGroup`). Tên để trống → tự random (`randomPureGroupName`).',
    buttonLabel: 'Tạo group',
    fields: [
      { kind: 'identity' },
      {
        kind: 'text',
        id: 'groupName',
        label: 'Tên group (tuỳ chọn)',
        placeholder: 'Để trống → tên random tự sinh',
      },
    ],
    onSubmit: async (v) => {
      if (!v.identity?.trim()) throw new Error('Cần identity')
      const name = v.groupName?.trim() || randomPureGroupName('Manual')
      return logResult(await pureCreateGroup({ identityInput: v.identity, name }))
    },
  })
}

export function mountGroupAddMemberDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="7"]',
    hint: 'Thêm member — ví hoặc user contract; encrypt group key (`addMembers`). In group + members sau.',
    buttonLabel: 'Thêm member',
    fields: [
      { kind: 'identity' },
      {
        kind: 'text',
        id: 'groupContract',
        label: 'Group contract',
        placeholder: '0x… group',
      },
      {
        kind: 'text',
        id: 'member',
        label: 'Member (ví hoặc user contract)',
        placeholder: '0x…',
      },
    ],
    onSubmit: async (v) => {
      return logResult(
        await pureAddGroupMember({
          identityInput: v.identity,
          groupContract: v.groupContract,
          memberInput: v.member,
        }),
      )
    },
  })
}

export function mountGroupRemoveMemberDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="8"]',
    hint: 'Gọi `groupContract.removeMember` — resolve ví từ member input.',
    buttonLabel: 'Xóa member',
    fields: [
      { kind: 'identity' },
      { kind: 'text', id: 'groupContract', label: 'Group contract', placeholder: '0x…' },
      { kind: 'text', id: 'member', label: 'Member (ví hoặc user contract)', placeholder: '0x…' },
    ],
    onSubmit: async (v) =>
      logResult(
        await pureRemoveGroupMember({
          identityInput: v.identity,
          groupContract: v.groupContract,
          memberInput: v.member,
        }),
      ),
  })
}

export function mountGroupTransferAdminDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="9"]',
    hint: 'Chuyển chủ nhóm — `transferAdmin` + publicKey admin mới (giống leave-group flow).',
    buttonLabel: 'Chuyển chủ group',
    fields: [
      { kind: 'identity' },
      { kind: 'text', id: 'groupContract', label: 'Group contract', placeholder: '0x…' },
      {
        kind: 'text',
        id: 'member',
        label: 'Member mới (admin) — ví hoặc user contract',
        placeholder: '0x…',
      },
    ],
    onSubmit: async (v) =>
      logResult(
        await pureTransferGroupAdmin({
          identityInput: v.identity,
          groupContract: v.groupContract,
          memberInput: v.member,
        }),
      ),
  })
}

export function mountGroupInfoDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="10"]',
    hint: 'Đọc `getGroupInfo` + danh sách member on-chain.',
    buttonLabel: 'Lấy thông tin group',
    fields: [
      { kind: 'identity' },
      { kind: 'text', id: 'groupContract', label: 'Group contract', placeholder: '0x…' },
    ],
    onSubmit: async (v) =>
      logResult(
        await pureFetchGroupInfo({
          identityInput: v.identity,
          groupContract: v.groupContract,
        }),
      ),
  })
}
