import groupContract from './group-contract.json'

export const groupAbis = {
  admin: groupContract.find((item) => item.name === 'admin'),
  addMember: groupContract.find((item) => item.name === 'addMember'),
  sendMessage: groupContract.find((item) => item.name === 'sendMessage'),
  getMyEncryptedGroupKey: groupContract.find((item) => item.name === 'getMyEncryptedGroupKey'),
  getMemberListGroup: groupContract.find((item) => item.name === 'getMemberListGroup'),
  getProcessedGroupMessages: groupContract.find(
    (item) => item.name === 'getProcessedGroupMessages'
  ),
  editMessage: groupContract.find((item) => item.name === 'editMessage'),
  deleteMessage: groupContract.find((item) => item.name === 'deleteMessage'),
  reactToMessage: groupContract.find((item) => item.name === 'reactToMessage'),
  groupName: groupContract.find((item) => item.name === 'groupName'),
  unReactToMessage: groupContract.find((item) => item.name === 'unReactToMessage'),
  getMessageById: groupContract.find((item) => item.name === 'getMessageById'),
  markMessagesAsRead: groupContract.find((item) => item.name === 'markMessagesAsRead'),
  addAllMember: groupContract.find((item) => item.name === 'addAllMember')
}

export { groupContract }
