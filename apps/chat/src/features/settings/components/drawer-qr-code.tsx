'use client'
import type { Account } from '@/modules/account'
import AvatarUser from '@/shared/components/avatar-user'
import { QrCode } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'
import { QRCode } from 'react-qrcode-logo'

interface DrawerQRCodeProps {
  account: Account
}

function DrawerQRCode({ account }: DrawerQRCodeProps) {
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>
        <button className="outline-none">
          <QrCode className="size-6" />
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none">
          <div className="bg-gray-100 rounded-t-[42px] overflow-hidden flex flex-col h-[90vh] p-3">
            <div className="max-w-md mx-auto w-full h-full flex items-center justify-center">
              {/* Card */}
              <div
                className="w-[340px] h-[360px] bg-white rounded-4xl relative flex flex-col items-center justify-center"
                style={{
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
                }}
              >
                <AvatarUser
                  size="2xl"
                  name={account?.name ?? 'Yuu'}
                  url={account?.avatar}
                  className="absolute -top-12 left-1/2 -translate-x-1/2"
                />

                {/* Beautiful QR */}
                <div className="mt-8 bg-white p-4 rounded-3xl">
                  <QRCode
                    value={JSON.stringify(account.contractAddress)}
                    size={240}
                    logoImage={account.avatar}
                    logoWidth={50}
                    logoHeight={50}
                    eyeRadius={[
                      {
                        // top-left
                        outer: [10, 10, 0, 10],
                        inner: [6, 6, 0, 6]
                      },
                      {
                        // top-right
                        outer: [10, 10, 10, 0],
                        inner: [6, 6, 6, 0]
                      },
                      {
                        // bottom-left
                        outer: [10, 0, 10, 10],
                        inner: [6, 0, 6, 6]
                      }
                    ]}
                    quietZone={10}
                    bgColor="#fff"
                    fgColor="#000"
                  />
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default React.memo(DrawerQRCode)
