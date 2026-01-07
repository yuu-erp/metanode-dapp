export const getActiveCodesByDeviceInfo = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_IP',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '_screenSize',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '_os',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '_versionOs',
        type: 'string'
      }
    ],
    name: 'getActiveCodesByDeviceInfo',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
