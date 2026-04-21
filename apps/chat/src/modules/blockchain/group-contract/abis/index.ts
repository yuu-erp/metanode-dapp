import group from './_group.json'

export const groupAbis = {
  admin: group.find((item) => item.name === 'admin'),
  addMember: group.find((item) => item.name === 'addMember'),
  sendMessage: group.find((item) => item.name === 'sendMessage'),
  getMyEncryptedGroupKey: group.find((item) => item.name === 'getMyEncryptedGroupKey'),
  getMemberListGroup: group.find((item) => item.name === 'getMemberListGroup'),
  getProcessedGroupMessages: group.find((item) => item.name === 'getProcessedGroupMessages'),
  editMessage: group.find((item) => item.name === 'editMessage'),
  deleteMessage: group.find((item) => item.name === 'deleteMessage'),
  reactToMessage: group.find((item) => item.name === 'reactToMessage'),
  groupName: group.find((item) => item.name === 'groupName')
}
