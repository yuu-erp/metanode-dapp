import anonymousGroup from './communityGroup.json'

export const anonymousGroupAbi: Record<string, any> = {
  sendMessage: anonymousGroup.find((item) => item.name === 'sendMessage'),
  editMessage: anonymousGroup.find((item) => item.name === 'editMessage'),
  deleteMessage: anonymousGroup.find((item) => item.name === 'deleteMessage'),
  getMyEncryptedGroupKey: anonymousGroup.find((item) => item.name === 'getMyEncryptedGroupKey'),
  getProcessedGroupMessagesWithReactions: anonymousGroup.find(
    (item) => item.name === 'getProcessedGroupMessagesWithReactions'
  ),
  getPublicMemberList: anonymousGroup.find((item) => item.name === 'getPublicMemberList')
}
