import {
  enhancedAgentManagementContract,
  MeosContract,
  type GetAgentFromDomainResult,
  type MeosContracts
} from '@/shared/services/contracts'
import { getHiddenWallet } from '@metanodejs/system-core'

export class ContractManager {
  private static instance: ContractManager
  private meosContract: MeosContract | null = null
  private meosAddresses: MeosContracts | null = null
  private agentInfo: GetAgentFromDomainResult | null = null
  private isInitializing = false

  private constructor() {}

  public static getInstance(): ContractManager {
    if (!ContractManager.instance) {
      ContractManager.instance = new ContractManager()
    }
    return ContractManager.instance
  }

  public setFromAddress(address: string) {
    // Re-initialize MeosContract if it exists and we have the address
    if (this.meosAddresses && this.meosAddresses.StaffMeosSC) {
      this.meosContract = new MeosContract(this.meosAddresses.StaffMeosSC, address)
    } else if (this.meosAddresses && !this.meosAddresses.StaffMeosSC) {
      console.warn('StaffMeosSC address not found, cannot re-initialize MeosContract.')
    }
  }

  public async initialize(domain: string): Promise<void> {
    if (this.meosContract || this.isInitializing) return
    this.isInitializing = true
    try {
      const { address } = await getHiddenWallet()
      console.log('Initializing ContractManager...', { userAddress: address, domain })
      // 1. Get Agent Info from Domain
      const agentInfo = await enhancedAgentManagementContract.getAgentFromDomain(
        { _domain: domain },
        address
      )
      console.log('Agent Info fetched:', agentInfo)
      if (
        !agentInfo.agentAdd ||
        !agentInfo.branchId ||
        agentInfo.agentAdd === '0000000000000000000000000000000000000000'
      ) {
        throw new Error('Agent not found')
      }
      this.agentInfo = agentInfo

      // 2. Get Meos Contract Addresses
      const meosAddresses = await enhancedAgentManagementContract.getMeosSCByAgentFromFactory(
        {
          _agent: agentInfo.agentAdd,
          _branchId: agentInfo.branchId
        },
        address
      )
      console.log('Meos Addresses fetched:', meosAddresses)

      this.meosAddresses = meosAddresses

      // 3. Initialize MeosContract with specific address (e.g., StaffMeosSC or relevant one)
      // Assuming we want to interact with StaffMeosSC or a main Meos contract.
      // Adjust based on requirements if we need multiple instances.
      if (meosAddresses.StaffMeosSC) {
        this.meosContract = new MeosContract(meosAddresses.StaffMeosSC, address)
      } else {
        console.warn('StaffMeosSC address not found in fetched addresses.')
      }
    } catch (error) {
      console.error('Failed to initialize ContractManager:', error)
      throw error
    } finally {
      this.isInitializing = false
    }
  }

  public getMeosContract(): MeosContract | null {
    return this.meosContract
  }

  public getMeosAddresses(): MeosContracts | null {
    return this.meosAddresses
  }

  public getAgentInfo(): GetAgentFromDomainResult | null {
    return this.agentInfo
  }
}
