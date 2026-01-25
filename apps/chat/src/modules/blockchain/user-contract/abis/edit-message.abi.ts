export const editMessage = [
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
        name: 'newEncryptedContent',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'newEncryptedContentForPartner',
        type: 'string'
      }
    ],
    name: 'editMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
