import type { Wallet } from '@/modules/wallet'
import { compareAddress } from '@/shared/lib'
import {
  createWallet,
  createWalletFromPrivateKey,
  getAllWallets,
  getSeed,
} from '@metanodejs/system-core'

export type WalletIdentityKind = 'random' | 'privateKey' | 'address'

export type ResolvedPureWallet = {
  kind: WalletIdentityKind
  wallet: Wallet
}

const PRIVATE_KEY_RE = /^(0x)?[a-fA-F0-9]{64}$/
const ADDRESS_RE = /^(0x)?[a-fA-F0-9]{40}$/i

export function normalizeEthAddress(value: string): string {
  const trimmed = value.trim()
  const hex = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
  return hex.toLowerCase()
}

export function isValidPrivateKey(value: string): boolean {
  return PRIVATE_KEY_RE.test(value.trim())
}

export function isValidEthAddress(value: string): boolean {
  return ADDRESS_RE.test(value.trim())
}

export function classifyWalletIdentityInput(raw: string): WalletIdentityKind {
  const trimmed = raw.trim()
  if (!trimmed) return 'random'
  if (isValidPrivateKey(trimmed)) return 'privateKey'
  if (isValidEthAddress(trimmed)) return 'address'
  throw new Error('Nhập private key (64 hex) hoặc địa chỉ ví (40 hex), hoặc để trống để tạo ví mới')
}

async function resolveWalletAfterCreate(
  hintAddress?: string,
  fallbackName?: string,
): Promise<Wallet> {
  const wallets = await getAllWallets()
  if (hintAddress) {
    const found = wallets.find((w) => compareAddress(w.address, hintAddress))
    if (found) return found
  }
  const last = wallets[wallets.length - 1]
  if (!last?.address) {
    throw new Error('Wallet not found after create')
  }
  if (fallbackName && !last.name) {
    return { ...last, name: fallbackName }
  }
  return last
}

async function walletFromAddress(addressInput: string): Promise<Wallet> {
  const address = normalizeEthAddress(addressInput)
  const wallets = await getAllWallets()
  const found = wallets.find((w) => compareAddress(w.address, address))
  if (found) return found
  return { address, name: `pure_addr_${address.slice(2, 8)}` }
}

async function walletFromPrivateKey(privateKeyInput: string): Promise<Wallet> {
  const name = `pure_wallet_${Date.now()}`
  const res = (await createWalletFromPrivateKey({
    privateKey: privateKeyInput.trim(),
    name,
    backgroundImage: '',
  })) as { address?: string; wallet?: { address?: string } }
  const hint = res?.address ?? res?.wallet?.address
  return resolveWalletAfterCreate(hint, name)
}

async function walletRandom(): Promise<Wallet> {
  const name = `pure_wallet_${Date.now()}`
  const seedRes = await getSeed()
  const listSeed = seedRes?.listSeed
  if (!listSeed?.length) {
    throw new Error('getSeed() không trả về seed')
  }
  const created = (await createWallet({
    seed: listSeed,
    name,
    backgroundImage: '',
  })) as Wallet & { address?: string }
  if (created?.address) return created
  return resolveWalletAfterCreate(undefined, name)
}

/** Private key → import ví; address → ví local hoặc placeholder; trống → createWallet. */
export async function resolveWalletFromIdentityInput(raw: string): Promise<ResolvedPureWallet> {
  const kind = classifyWalletIdentityInput(raw)
  switch (kind) {
    case 'random':
      return { kind, wallet: await walletRandom() }
    case 'privateKey':
      return { kind, wallet: await walletFromPrivateKey(raw) }
    case 'address':
      return { kind, wallet: await walletFromAddress(raw) }
  }
}
