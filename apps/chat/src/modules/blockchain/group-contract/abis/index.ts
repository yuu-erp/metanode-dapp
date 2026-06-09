import groupContract from './group-contract.json'

export const groupAbis = {
  ...Object.fromEntries(
    groupContract.filter((item) => item.type === 'function').map((item) => [item.name, [item]])
  )
}

export { groupContract }
