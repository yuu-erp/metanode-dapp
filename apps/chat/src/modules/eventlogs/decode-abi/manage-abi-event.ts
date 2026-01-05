import { createHash } from '@metanodejs/system-core'

// Define stricter interfaces for ABI items and events
interface IAbiItemBase {
  internalType?: string
  name?: string
  type: string // Required for valid ABI
  indexed?: boolean // Optional, as not all inputs are indexed
}

export interface IAbiEvent {
  inputs: IAbiItemBase[]
  name: string
  type: 'event' // Restrict to event type
  anonymous?: boolean // Relevant for events
}

interface AbiData {
  functionName: string
  nonIndexedInputs: IAbiItemBase[]
}

// Cache for computed hashes to avoid redundant calculations
const hashCache = new Map<string, string>()

export class ManageAbiEvent {
  private readonly abiEvents = new Map<string, AbiData>()

  /**
   * Registers an array of ABI events, mapping their signatures to non-indexed inputs.
   * @param abiEvents Array of ABI event definitions
   * @throws Error if an ABI is invalid or already registered
   */
  public async registerAbi(abiEvents: IAbiEvent[]): Promise<void> {
    for (const abi of abiEvents) {
      if (abi.type !== 'event') {
        throw new Error(`Invalid ABI type: ${abi.type}. Expected 'event'.`)
      }

      const hash = await this.abiToHash(abi)
      if (this.abiEvents.has(hash)) {
        throw new Error(`ABI event ${abi.name} already registered.`)
      }

      this.abiEvents.set(hash, {
        functionName: abi.name,
        nonIndexedInputs: abi.inputs.filter((i) => !i.indexed)
      })
    }
    console.log('LIST ABI REGISTER LISTEN EVENTLOGS ----', this.abiEvents)
  }

  /**
   * Generates a hash for an ABI event signature.
   * @param abi The ABI event to hash
   * @returns The hashed signature
   * @throws Error if the ABI is invalid
   */
  private async abiToHash(abi: IAbiEvent): Promise<string> {
    if (!abi.name || !Array.isArray(abi.inputs)) {
      throw new Error('Invalid event ABI: name or inputs missing.')
    }

    const types = abi.inputs.map((input) => {
      if (!input.type) {
        throw new Error(`Invalid input in ABI ${abi.name}: type missing.`)
      }
      return input.type
    })

    const signature = `${abi.name}(${types.join(',')})`
    // Check cache first
    if (hashCache.has(signature)) {
      return hashCache.get(signature)!
    }

    const hash = await createHash(signature, false) // Assuming createHash is async
    hashCache.set(signature, hash)
    return hash
  }

  /**
   * Retrieves the ABI data for a given hash.
   * @param hash The event signature hash
   * @returns The associated AbiData or undefined if not found
   */
  public getAbiData(hash: string): AbiData | undefined {
    return this.abiEvents.get(hash)
  }
}
