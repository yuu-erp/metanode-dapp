import type { Profile } from '@/interfaces'
import { getAllProfiles, sendCommand } from '@metanodejs/system-core'

export class ProfileRepository {
  createProfile() {}
  async getAllProfile(): Promise<Profile[]> {
    return await getAllProfiles<Profile>()
  }
  async getCurrentProfile(): Promise<Profile> {
    return await sendCommand('getCurrentProfile')
  }
}
export const profileRepository = new ProfileRepository()
