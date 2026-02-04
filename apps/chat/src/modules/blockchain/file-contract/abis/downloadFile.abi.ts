export const downloadFileAbi = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'fileKey',
        type: 'bytes32'
      },
      {
        internalType: 'uint256',
        name: 'start',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256'
      }
    ],
    name: 'downloadFile',
    outputs: [
      {
        internalType: 'bytes[]',
        name: '',
        type: 'bytes[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
