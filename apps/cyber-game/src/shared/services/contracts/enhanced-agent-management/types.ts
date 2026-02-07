export interface GetAgentFromDomainArgs {
  _domain: string
}

export interface GetAgentFromDomainResult {
  agentAdd: string
  branchId: string
}

export interface MeosContracts {
  StaffMeosSC: string
  NetCafeUser: string
  NetCafeSession: string
  NetCafeTopUp: string
  NetCafeSpend: string
  NetCafeManagement: string
  NetCafeStation: string
  owner: string
  StaffAgentStore: string
  Points: string
}

export interface GetMeosSCByAgentFromFactoryArgs {
  _agent: string
  _branchId: string
}
