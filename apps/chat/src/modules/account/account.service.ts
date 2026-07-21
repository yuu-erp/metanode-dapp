import { CONTRACT_ADDRESSES } from '@/config'
import type { FactoryContract, UserContract } from '@/modules/blockchain'
import type { Wallet, WalletService } from '@/modules/wallet'
import { compareAddress } from '@/shared/lib'
import { formatAddress } from '@/shared/utils'
import { getHiddenWallet, sendCommand } from '@metanodejs/system-core'
import type { EventLogContainer, EventMap } from '../eventlogs'
import { activateAccount, createAccount } from './account.entity'
import type { AccountRepository } from './account.repository'
import type { Account } from './account.types'
import { detectNameFromWalletName, generateAvailableUsername } from './utils'

export class AccountService {
  constructor(
    private readonly walletService: WalletService,
    private readonly repository: AccountRepository,
    private readonly factoryContract: FactoryContract,
    private readonly userContract: UserContract,
    private readonly eventLog: EventLogContainer
  ) {}

  async loadAccounts() {
    const accounts = await this.repository.getAll()
    return accounts
  }

  async getCurrentAccount(): Promise<Account | undefined> {
    const account = await this.repository.getActive()
    return account
  }

  async registerUser(wallet: Wallet, name?: string): Promise<Account> {
    console.log('registerUser 1', this.eventLog)
    await this.eventLog.eventLog.registerEvent(wallet.address, [CONTRACT_ADDRESSES.factory])
    const address = wallet.address

    // lay hidden wallet
    console.log('registerUser 2')

    const hiddenWallet = (await getHiddenWallet()).address

    // 1. Check on-chain
    const isRegistered = await this.factoryContract.checkUserContract({
      from: hiddenWallet,
      inputData: {
        user: address
      }
    })

    // 3. Get public key
    const publicKey = await this.walletService.getEncryptedPublicKey(address)
    console.log('registerUser 3', publicKey)
    if (!isRegistered) {
      const username = await generateAvailableUsername(
        wallet.name,
        address,
        this.factoryContract.isUsernameTaken.bind(this.factoryContract)
      )

      const { firstName, lastName } = detectNameFromWalletName(wallet.name)
      const inputData = {
        publicKey,
        userName: username,
        firstName: name ?? firstName,
        lastName,
        avatar: '',
        bio: '',
        delegateAddress: address
      }
      console.log('registerUser 4', inputData)

      await this.factoryContract.registerUser({
        from: hiddenWallet,
        inputData
      })
    } else {
      const delegateInfo = await this.factoryContract.getDelegateInfo({
        from: hiddenWallet,
        inputData: {
          _delegate: hiddenWallet
        }
      })
      console.log('[registerUser] delegateInfo 1', delegateInfo)
      const isDelegated = Number(delegateInfo.owner) !== 0
      console.log('[registerUser] delegateInfo 2', isDelegated)

      if (!isDelegated) {
        const promise = new Promise((res, rej) => {
          const log = this.eventLog.eventLog
          const onDelegateAddedToOwner = (e: EventMap['DelegateAddedToOwner']) => {
            if (compareAddress(e.delegate, hiddenWallet)) {
              cleanup()
              res('Delegate successfully')
            }
          }
          const onDelegateRequestFailed = (e: EventMap['DelegateRequestFailed']) => {
            if (compareAddress(e.senderRequest, hiddenWallet)) {
              cleanup()
              rej(e.reason)
            }
          }
          const cleanup = () => {
            log.off('DelegateAddedToOwner', onDelegateAddedToOwner)
            log.off('DelegateRequestFailed', onDelegateRequestFailed)
          }

          log.on('DelegateAddedToOwner', onDelegateAddedToOwner)
          log.on('DelegateRequestFailed', onDelegateRequestFailed)
        })
        console.log('{sign, hashedMessage} 0')

        const sign = await signPersonal(address, hiddenWallet)

        console.log('{sign, hashedMessage} 1', { sign })

        const { hash: hashedMessage } = await sendCommand('createHash', {
          isHex: true,
          message: hiddenWallet
        })
        console.log('{sign, hashedMessage} 2', { hashedMessage })

        const { publicKey } = await sendCommand(
          window?.finSdk ? 'getPublicKey' : 'getPublicKeyFromDb',
          {
            address: address
          }
        )

        const inputData = {
          _owner: address,
          _message: hashedMessage,
          _signature: sign,
          _blsPubKey: publicKey
        }
        console.log('{sign, hashedMessage} 4', { inputData })
        await this.factoryContract.delegateFromOtherDevice({
          from: hiddenWallet,
          inputData
        })
        console.log('{sign, hashedMessage} 5')

        await promise
      }
    }

    // 5. Lấy user contract address (luôn làm)
    const contractAddress = await this.factoryContract.getUserContract({
      from: hiddenWallet,
      inputData: {
        user: address
      }
    })

    if (!contractAddress) {
      throw new Error('User contract not found')
    }

    // 6. Lấy profile từ on-chain
    const profile = await this.userContract.userProfile({
      from: hiddenWallet,
      to: contractAddress
    })

    // 7. Sync xuống local
    const account: Account = createAccount({
      name: `${profile.firstName} ${profile.lastName}`,
      address,
      username: profile.userName,
      contractAddress,
      publicKey,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      bio: profile.bio,
      hiddenAddress: hiddenWallet
    })

    const activeAccount = activateAccount(account)
    await this.repository.upsert(activeAccount)
    await this.repository.setActive(address)
    return account
  }

  async logout(account?: Account): Promise<void> {
    console.log('[logout] 1')
    if (!account) return
    console.log('[logout] 2')

    const hiddenWallet = (await getHiddenWallet()).address
    const info = await this.factoryContract.getDelegateInfo({
      from: hiddenWallet,
      inputData: { _delegate: hiddenWallet }
    })

    console.log('[logout] 3', { hiddenWallet, info })

    await this.userContract.removeDelegate({
      from: hiddenWallet,
      to: account.contractAddress,
      inputData: { _delegate: hiddenWallet }
    })

    console.log('[logout] 4')

    await this.repository.clearActive()
  }

  async checkUserContract(account: Account): Promise<boolean> {
    return await this.factoryContract.checkUserContract({
      from: account.hiddenAddress,
      inputData: { user: account.address }
    })
  }

  async useProfile(address: string, conversationId: string) {
    return await this.userContract.userProfile({
      from: address,
      to: conversationId
    })
  }

  async syncByRegisterMeeting(account: Account): Promise<void> {
    try {
      const currentFactory = await this.userContract.meetingFactoryAddress({
        from: account.address,
        to: account.contractAddress
      })

      const envFactory = import.meta.env.VITE_MEETING
      console.log(`[AccountService] Current meeting factory: ${formatAddress(currentFactory)}`)
      console.log(`[AccountService] Environment meeting factory: ${formatAddress(envFactory)}`)
      if (formatAddress(currentFactory) !== formatAddress(envFactory)) {
        console.log(
          `[AccountService] Updating meeting factory from ${currentFactory} to ${envFactory}`
        )
        await this.userContract.setMeetingFactory({
          from: account.address,
          to: account.contractAddress,
          inputData: {
            _newMeetingFactoryAddress: envFactory
          }
        })
      }
    } catch (error) {
      console.error('[AccountService] Failed to sync meeting factory:', error)
    }
  }
}

async function signPersonal(address: string, input: string) {
  if (window.fiaiSDK) {
    return (
      await sendCommand('signWithWallet', {
        algorithm: 'secp256k1',
        address: address,
        payload: input
      })
    ).signature
  }
  return (
    await sendCommand('createSign', {
      address: address,
      message: input,
      isHex: true
    })
  ).sign
}
