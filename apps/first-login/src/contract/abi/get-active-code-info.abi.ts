export const getActiveCodeInfo = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_activeCode',
        type: 'uint256'
      }
    ],
    name: 'getActiveCodeInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'domain',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'installUrl',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'bundleId',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'platform',
            type: 'string'
          },
          {
            internalType: 'uint256',
            name: 'createTime',
            type: 'uint256'
          }
        ],
        internalType: 'struct MerchantActiveCode.Merchant',
        name: 'infoCode',
        type: 'tuple'
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'IP',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'screenSize',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'os',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'versionOs',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'refCode',
            type: 'string'
          },
          {
            internalType: 'uint256',
            name: 'activeCode',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256'
          }
        ],
        internalType: 'struct MerchantActiveCode.Device',
        name: 'infoActive',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
