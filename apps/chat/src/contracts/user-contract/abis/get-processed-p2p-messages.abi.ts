export const getProcessedP2PMessages = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'partnerContractAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'page',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256'
      }
    ],
    name: 'getProcessedP2PMessages',
    outputs: [
      {
        components: [
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
            name: 'finalContent',
            type: 'string'
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256'
          },
          {
            internalType: 'bool',
            name: 'isDeleted',
            type: 'bool'
          },
          {
            internalType: 'string',
            name: 'reactionSummary',
            type: 'string'
          },
          {
            internalType: 'bool',
            name: 'isRead',
            type: 'bool'
          }
        ],
        internalType: 'struct UserContractV3.ProcessedP2PMessage[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
