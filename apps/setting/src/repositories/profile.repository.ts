import type { Profile } from '@/interfaces'
import { getAllProfiles, loginProfile, sendCommand, updatePassword } from '@metanodejs/system-core'

export class ProfileRepository {
  createProfile() {}
  async getAllProfile(): Promise<Profile[]> {
    return await getAllProfiles<Profile>()
  }
  async getCurrentProfile(): Promise<Profile> {
    return await sendCommand('getCurrentProfile')
  }
  async updatePassword(payload: { id: number; password: string; passwordConfirm: string }) {
    return await updatePassword(payload)
  }
  async loginProfile(payload: { id: number; password: string }) {
    return await loginProfile(payload)
  }
}
export const profileRepository = new ProfileRepository()
