export const getMessageById = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_messageId',
        type: 'bytes32'
      }
    ],
    name: 'getMessageById',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32'
      },
      {
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'encryptedContent',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
