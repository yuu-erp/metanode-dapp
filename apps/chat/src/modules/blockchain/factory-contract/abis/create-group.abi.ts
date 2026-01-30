export const createGroup = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'groupName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'groupAvatar',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'encryptedInitialGroupKey',
        type: 'string'
      },
      {
        internalType: 'enum FactoryV3.HistoryVisibility',
        name: 'initialPolicy',
        type: 'uint8'
      }
    ],
    name: 'createGroup',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
