export const sendMessage = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_recipientContractAddress',
        type: 'address'
      },
      {
        internalType: 'string',
        name: '_encryptedContentForRecipient',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '_encryptedContentForSelf',
        type: 'string'
      }
    ],
    name: 'sendMessage',
    outputs: [
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
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32'
      },
      {
        internalType: 'string',
        name: 'encryptedContent',
        type: 'string'
      },
      {
        internalType: 'address',
        name: 'dataStoreAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'messageNonce',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
