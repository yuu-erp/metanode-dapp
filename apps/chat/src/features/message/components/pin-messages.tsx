'use client'
import { useI18N } from '@/shared/hooks'
import { PinIcon } from 'lucide-react'
import * as React from 'react'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { container } from '@/container'
import type { AppEvents } from '@/types/app-events'

interface PinMessagesProps {
  account?: Account
  conversation?: Conversation
}
function PinMessages({ account, conversation }: PinMessagesProps) {
  const { t } = useI18N()
  const connectWebRTC = React.useCallback(async () => {
    if (!account || !conversation) return

    try {
      const session = await container.sessionManager.createSession({
        participantId: account.address,
        conversationId: conversation.conversationId,
        connectionType: 'send' // publisher
      })

      console.log('Session created (sender):', session.sessionId)

      // 1. Tạo DataChannel ở phía publisher (gọi API Cloudflare)
      const channelName = 'test-channel'
      const createResult = await container.transportService.createDataChannel(session, channelName)
      // Giả sử createDataChannel đã gọi /datachannels/new location=local và xử lý renegotiation

      // 2. Publisher cần lấy RTCDataChannel thật (thường qua ondatachannel hoặc từ adapter trả về)
      // Nếu adapter không trả RTCDataChannel → đăng ký ondatachannel
      let publisherDc: RTCDataChannel | null = null

      container.transportService.onRemoteDataChannel(session, (ev) => {
        const dc = ev.channel
        if (dc.label === channelName) {
          publisherDc = dc
          console.log('Publisher got its own DataChannel for sending')

          dc.onopen = () => {
            console.log('Publisher DataChannel OPEN - bắt đầu gửi mỗi 5s')

            const sendPing = () => {
              if (dc.readyState === 'open') {
                const msg = `Ping from sender at ${new Date().toLocaleTimeString()}`
                dc.send(msg)
                console.log('Sent:', msg)
              }
            }

            sendPing() // gửi ngay lần đầu
            const interval = setInterval(sendPing, 5000)

            dc.onclose = () => clearInterval(interval)
          }

          // Publisher thường không cần onmessage (vì unidirectional)
        }
      })

      // Publish channel name + sessionId cho người khác qua contract/event
      await container.userContract.sendDataChannel({
        from: account.address,
        to: account.contractAddress,
        inputData: {
          _recipientContractAddress: conversation.conversationId,
          sessionId: session.sessionId,
          channelName: channelName
        }
      })
    } catch (err) {
      console.error('Sender setup failed:', err)
    }
  }, [account, conversation])
  React.useEffect(() => {
    if (!account || !conversation) return
    const handleDataChannel = async (data: AppEvents['webrtc.datachannel.received']) => {
      try {
        console.log('Received channel info:', data)

        const session = await container.sessionManager.createSession({
          participantId: account.address,
          conversationId: conversation.conversationId,
          connectionType: 'receive' // subscriber
        })

        // 1. Pull / subscribe channel từ publisher
        const pullResult = await container.transportService.pullDataChannel(
          session,
          data.sessionId, // sessionId của sender
          data.channelName
        )

        console.log('Pull result:', pullResult)

        // 2. Quan trọng: ĐĂNG KÝ ondatachannel để nhận RTCDataChannel thật từ SFU
        container.transportService.onRemoteDataChannel(session, (ev) => {
          const dc = ev.channel
          console.log('Receiver: ondatachannel fired!', {
            label: dc.label,
            id: dc.id,
            readyState: dc.readyState
          })

          if (dc.label === data.channelName) {
            dc.onopen = () => {
              console.log('Receiver DataChannel OPEN → sẵn sàng nhận message mỗi 5s')
              // Không cần gửi gì vì unidirectional
            }

            dc.onmessage = (event) => {
              console.log('Receiver GOT MESSAGE:', event.data)
              // Ở đây bạn có thể update UI, hiển thị message, v.v.
            }

            dc.onerror = (err) => console.error('DataChannel error:', err)
            dc.onclose = () => console.log('DataChannel closed')
          }
        })

        // 3. Theo dõi connection/ICE để debug
        container.transportService.onConnectionStateChange(session, (state) =>
          console.log('Receiver connectionState:', state)
        )
        container.transportService.onICEConnectionStateChange(session, (state) =>
          console.log('Receiver ICE state:', state)
        )
      } catch (err) {
        console.error('Receiver setup failed:', err)
      }
    }
    container.eventBus.on('webrtc.datachannel.received', handleDataChannel)

    return () => {
      container.eventBus.off('webrtc.datachannel.received', handleDataChannel)
    }
  }, [account, conversation])
  return (
    <div
      className="h-14 flex items-center py-2 gap-3 sticky w-full z-10 px-3 bg-white/40 text-black shadow border-app"
      style={{
        top: 'var(--header-height)'
      }}
      onClick={connectWebRTC}
    >
      <span className="h-full w-[3px] rounded-md bg-black"></span>
      <div className="h-full flex-1 flex items-center">
        <div>
          <div className="text-base font-bold flex-1 line-clamp-1 break-all">
            {t('pinnedMessage')}
          </div>
          <div className="flex-1 text-sm font-medium break-all text-black/60 line-clamp-1 break-all">
            We sent an AI agent to read the entire internet. Every release, every hot take, and
            every unreadable blog post from the past week. It's now standing by to build a
            presidential brief just for you. It barely survived. You (hopefully) will.
          </div>
        </div>
        <PinIcon className="shrink-0 size-5" />
      </div>
    </div>
  )
}

export default React.memo(PinMessages)
