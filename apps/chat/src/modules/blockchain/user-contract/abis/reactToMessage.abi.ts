export const reactToMessage = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'partnerContract',
        type: 'address'
      },
      {
        internalType: 'bytes32',
        name: '_messageId',
        type: 'bytes32'
      },
      {
        internalType: 'string',
        name: '_reaction',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '_reactionToPartner',
        type: 'string'
      }
    ],
    name: 'reactToMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
