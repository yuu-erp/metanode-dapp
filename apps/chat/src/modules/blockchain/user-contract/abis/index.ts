import userContract from './user-contract.json'

export const userAbi = {
  ...Object.fromEntries(
    userContract.filter((item) => item.type === 'function').map((item) => [item.name, [item]])
  )
}

export { userContract }
