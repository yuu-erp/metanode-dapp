import userContract from './user-contract.json'

export const userAbi = {
  userProfile: userContract.find((item) => item.name === 'userProfile'),
  getFullInbox: userContract.find((item) => item.name === 'getFullInbox'),
  publicKey: userContract.find((item) => item.name === 'publicKey'),
  getProcessedP2PMessages: userContract.find((item) => item.name === 'getProcessedP2PMessages'),
  sendMessage: userContract.find((item) => item.name === 'sendMessage'),
  reactToMessage: userContract.find((item) => item.name === 'reactToMessage'),
  editMessage: userContract.find((item) => item.name === 'editMessage'),
  deleteMessageV2: userContract.find((item) => item.name === 'deleteMessageV2'),
  sendDataChannel: userContract.find((item) => item.name === 'sendDataChannel'),
  getMessageById: userContract.find((item) => item.name === 'getMessageById'),
  setMeetingFactory: userContract.find((item) => item.name === 'setMeetingFactory'),
  meetingFactoryAddress: userContract.find((item) => item.name === 'meetingFactoryAddress'),
  owner: userContract.find((item) => item.name === 'owner'),
  detailedSettings: userContract.find((item) => item.name === 'detailedSettings'),
  getDetailedSettings: userContract.find((item) => item.name === 'getDetailedSettings'),
  setP2PChatEnabled: userContract.find((item) => item.name === 'setP2PChatEnabled'),
  setReactionsEnabled: userContract.find((item) => item.name === 'setReactionsEnabled')
}
