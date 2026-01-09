'use client'
import { useCurrentAccount, useI18N } from '@/shared/hooks'
import { useCheckUserContract } from '@/shared/hooks/accounts'
import { AlertTriangle, MoveRight } from 'lucide-react'
import * as React from 'react'

function AccountActivationNotice() {
  const { t } = useI18N()
  const { data: currentAccount } = useCurrentAccount()
  const { data: isActive, isLoading } = useCheckUserContract(currentAccount?.address)
  if (isLoading) return null
  if (typeof isActive === 'undefined') return null
  if (typeof isActive === 'boolean' && !isActive) return null
  return (
    <div className="w-full pt-3">
      <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <AlertTriangle className="mt-0.5 size-5 text-yellow-600" />

        <div className="flex flex-col gap-1 flex-1">
          <p className="text-sm font-semibold text-yellow-800">
            {t('accountActivationNotice.title')}
          </p>
          <p className="text-sm text-yellow-700">
            {t('accountActivationNotice.description')}
            {/* Vui lòng kích hoạt tài khoản để sử dụng đầy đủ các tính năng như nhắn tin, đồng bộ dữ
            liệu và bảo mật nâng cao. */}
          </p>

          <button
            className="mt-2 inline-flex items-center gap-1 self-start text-sm font-medium text-yellow-800 hover:underline"
            onClick={() => {
              // TODO: navigate to activation page
            }}
          >
            {t('accountActivationNotice.btn.activateNow')}
            {/* Kích hoạt ngay */}
            <MoveRight
              className="size-4"
              style={{
                animation: 'slideRightBack 2s ease-in-out infinite'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AccountActivationNotice)
