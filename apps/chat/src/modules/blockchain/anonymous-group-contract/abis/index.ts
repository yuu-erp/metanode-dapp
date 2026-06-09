import anonymousGroupContract from './anonymous-group-contract.json'

export const anonymousGroupAbi: Record<string, any> = {
  ...Object.fromEntries(
    anonymousGroupContract
      .filter((item) => item.type === 'function')
      .map((item) => [item.name, [item]])
  )
}

export { anonymousGroupContract }
