export const getFullInbox = [
  {
    inputs: [],
    name: 'getFullInbox',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'avatar',
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
            internalType: 'address',
            name: 'conversationId',
            type: 'address'
          },
          {
            internalType: 'string',
            name: 'latestMessageContent',
            type: 'string'
          },
          {
            internalType: 'uint256',
            name: 'latestMessageTimestamp',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'unreadCount',
            type: 'uint256'
          },
          {
            internalType: 'string',
            name: 'conversationType',
            type: 'string'
          }
        ],
        internalType: 'struct InboxItem[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
