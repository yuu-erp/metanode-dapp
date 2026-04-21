export const getFilesInfoAbi = [
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'fileKeys',
        type: 'bytes32[]'
      }
    ],
    name: 'getFilesInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32'
          },
          {
            internalType: 'uint64',
            name: 'contentLen',
            type: 'uint64'
          },
          {
            internalType: 'uint64',
            name: 'totalChunks',
            type: 'uint64'
          },
          {
            internalType: 'uint64',
            name: 'expireTime',
            type: 'uint64'
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'ext',
            type: 'string'
          },
          {
            internalType: 'enum FileStatus',
            name: 'status',
            type: 'uint8'
          },
          {
            internalType: 'string',
            name: 'contentDisposition',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'contentID',
            type: 'string'
          }
        ],
        internalType: 'struct Info[]',
        name: 'infos',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
