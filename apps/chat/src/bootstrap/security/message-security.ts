import { SecurityService } from '@/infrastructure/security'

export function bootstrapMessageSecurity() {
  const securityService = new SecurityService()
  return { securityService }
}
