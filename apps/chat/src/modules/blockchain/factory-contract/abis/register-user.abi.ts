export const registerUser = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'publicKey',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'userName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'firstName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'lastName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'avatar',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'bio',
        type: 'string'
      }
    ],
    name: 'registerUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
