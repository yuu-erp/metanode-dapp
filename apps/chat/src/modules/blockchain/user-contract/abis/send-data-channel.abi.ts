export const sendDataChannel = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_recipientContractAddress',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'sessionId',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'channelName',
        type: 'string'
      }
    ],
    name: 'sendDataChannel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
