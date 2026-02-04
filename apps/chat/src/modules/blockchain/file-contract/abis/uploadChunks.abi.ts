export const uploadChunksAbi = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'fileKey',
        type: 'bytes32'
      },
      {
        internalType: 'bytes[]',
        name: 'chunkDatas',
        type: 'bytes[]'
      },
      {
        internalType: 'bytes32[]',
        name: 'chunkHashes',
        type: 'bytes32[]'
      }
    ],
    name: 'uploadChunks',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
