import type { AnonymousGroupContract } from './anonymous-group-contract'
import type { GroupContract } from './group-contract'
import type { UserContract } from './user-contract'

export class Contracts {
  constructor(
    public readonly user: UserContract,
    public readonly group: GroupContract,
    public readonly anonymousGroup: AnonymousGroupContract
  ) {}
}
