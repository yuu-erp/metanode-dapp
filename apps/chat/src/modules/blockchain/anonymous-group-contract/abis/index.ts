import anonymousGroupContract from './anonymous-group-contract.json'

export const anonymousGroupAbi: Record<string, any> = {
  sendMessage: anonymousGroupContract.find((item) => item.name === 'sendMessage'),
  editMessage: anonymousGroupContract.find((item) => item.name === 'editMessage'),
  deleteMessage: anonymousGroupContract.find((item) => item.name === 'deleteMessage'),
  getMyEncryptedGroupKey: anonymousGroupContract.find(
    (item) => item.name === 'getMyEncryptedGroupKey'
  ),
  getProcessedGroupMessagesWithReactions: anonymousGroupContract.find(
    (item) => item.name === 'getProcessedGroupMessagesWithReactions'
  ),
  getPublicMemberList: anonymousGroupContract.find((item) => item.name === 'getPublicMemberList'),
  addMember: anonymousGroupContract.find((item) => item.name === 'addMember'),
  initialAdmin: anonymousGroupContract.find((item) => item.name === 'initialAdmin'),
  getAllMembers: anonymousGroupContract.find((item) => item.name === 'getAllMembers'),
  getAliasMember: anonymousGroupContract.find((item) => item.name === 'getAliasMember'),
  reactToMessage: anonymousGroupContract.find((item) => item.name === 'reactToMessage'),
  unReactToMessage: anonymousGroupContract.find((item) => item.name === 'unReactToMessage'),
  getMessageById: anonymousGroupContract.find((item) => item.name === 'getMessageById'),
  markMessagesAsRead: anonymousGroupContract.find((item) => item.name === 'markMessagesAsRead'),
  groupName: anonymousGroupContract.find((item) => item.name === 'groupName'),
  addManyMember: anonymousGroupContract.find((item) => item.name === 'addManyMember')
}

export { anonymousGroupContract }
