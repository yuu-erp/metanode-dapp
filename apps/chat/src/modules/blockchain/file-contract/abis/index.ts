import fileContract from './file-contract.json'

export const fileAbis = Object.fromEntries(
  fileContract.filter((item) => item.type === 'function').map((item) => [item.name, [item]])
)

export { fileContract }
