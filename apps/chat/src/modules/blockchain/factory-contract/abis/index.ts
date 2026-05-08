import factoryContract from './factory-contract.json'

const obj = Object.fromEntries(
  factoryContract.filter((item) => item.type === 'function').map((item) => [item.name, [item]])
)

export const factoryAbi = {
  ...obj
}

export { factoryContract }
