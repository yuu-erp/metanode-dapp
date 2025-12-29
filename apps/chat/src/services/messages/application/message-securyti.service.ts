import type { UserConversationService } from '@/infrastructure/blockchain/user'
import type { SecurityService } from '@/infrastructure/security'

export class MessageSecurytiService {
  constructor(
    private readonly securityService: SecurityService,
    private readonly userContractService: UserConversationService
  ) {}

  async decryptMessageReceived() {}
}
