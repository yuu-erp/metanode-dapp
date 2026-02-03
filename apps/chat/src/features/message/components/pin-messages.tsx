'use client'
import { useI18N } from '@/shared/hooks'
import { PinIcon } from 'lucide-react'
import * as React from 'react'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { container } from '@/container'
import type { AppEvents } from '@/types/app-events'
import { toast } from 'sonner'

interface PinMessagesProps {
  account?: Account
  conversation?: Conversation
}

function PinMessages({ account, conversation }: PinMessagesProps) {
  const { t } = useI18N()
  const senderDcRef = React.useRef<RTCDataChannel | null>(null)

  // -- SENDER LOGIC --
  const connectWebRTC = React.useCallback(async () => {
    if (!account || !conversation) return

    try {
      // 1. Create Session
      console.log('[Sender] Creating session...')
      const session = await container.sessionManager.createSession({
        participantId: account.contractAddress,
        conversationId: conversation.conversationId,
        connectionType: 'send'
      })
      console.log('[Sender] Session created:', session.sessionId)

      // 2. Create DataChannel
      const channelName = 'test-channel'
      console.log('[Sender] Creating DataChannel:', channelName)
      // Note: This calls the Cloudflare API to initialize the channel on the SFU
      await container.transportService.createDataChannel(session, channelName)

      // 3. Listen for the actual channel to Open (negotiated via Renegotiation)
      // Since 'createDataChannel' above triggers renegotiation, we wait for the channel to be ready.
      // In this specific architecture, we might need to listen to 'onRemoteDataChannel'
      // OR just rely on the fact that we initiated it.
      // However, for 'send' role, we typically get the channel via the PeerConnection DNE
      // or we just need to wait for 'onopen'.

      // Let's attach a listener to catch when the channel is actually usable.
      // But typically `createDataChannel` returns the channel object if wrapping native API,
      // Here it returns void, implies we assume it's created on the PC.
      // Let's try to get it from the session map if possible, or wait for negotiation.

      // FIX: The current transport service `createDataChannel` returns a Promise<RTCDataChannel>
      // in the code I saw earlier? Let me double check usage in `transport.service.ts`.
      // Wait, looking at previous context, it returns `Promise<RTCDataChannel>`.
      // So I should capture it.

      // RE-CHECK: I need to be sure about `createDataChannel` signature.
      // Previously: `const dc = await container.transportService.createDataChannel(session, 'test-channel')`
      // So yes, it returns the DC.

      // ERROR: The previous `write_to_file` in Step 383 had `const createResult = ...`
      // implying it returns something.

      // Converting to correct logic:
      const dc = await container.transportService.createDataChannel(session, channelName)
      senderDcRef.current = dc

      dc.onopen = () => {
        console.log('[Sender] DataChannel OPEN. Starting ping loop...')
        toast.success('Sender Connected! Sending pings...')

        const sendPing = () => {
          if (dc.readyState === 'open') {
            const msg = `Ping from Sender ${new Date().toLocaleTimeString()}`
            dc.send(msg)
            console.log('[Sender] Sent:', msg)
          }
        }
        sendPing()
        // const interval = setInterval(sendPing, 5000)
        // dc.onclose = () => clearInterval(interval)
      }

      dc.onclose = () => console.log('[Sender] DataChannel CLOSED')

      // 4. SIGNALING via Smart Contract
      console.log('[Sender] Signaling to Receiver via Contract...')
      await container.userContract.sendDataChannel({
        from: account.address,
        to: account.contractAddress,
        inputData: {
          _recipientContractAddress: conversation.conversationId,
          sessionId: session.sessionId, // Tell B which session to pull from
          channelName: channelName
        }
      })
      console.log('[Sender] Signal Sent!')
    } catch (err) {
      console.error('[Sender] Setup failed:', err)
      toast.error('Sender Connection Failed')
    }
  }, [account, conversation])

  // -- RECEIVER LOGIC --
  React.useEffect(() => {
    if (!account || !conversation) return

    const handleDataChannelReceived = async (data: AppEvents['webrtc.datachannel.received']) => {
      try {
        console.log('[Receiver] Received Signal:', data)
        toast.info('Receiving Connection Request...')

        // 1. Create Session
        const session = await container.sessionManager.createSession({
          participantId: account.contractAddress,
          conversationId: conversation.conversationId,
          connectionType: 'receive'
        })
        console.log('[Receiver] Session created:', session.sessionId)

        // 2. Pull DataChannel
        console.log('[Receiver] Pulling DataChannel...')
        const pullResult = await container.transportService.pullDataChannel(
          session,
          data.sessionId, // Sender's session ID
          data.channelName
        )
        console.log('[Receiver] Pull Result:', pullResult)

        // 3. Manually create the Negotiated Channel (Symmetric to Sender)
        // Cloudflare uses negotiated channels, so we must manually create it with the SAME ID on both sides.
        // We do NOT wait for ondatachannel.
        if (pullResult.dataChannels && pullResult.dataChannels.length > 0) {
          const channelId = parseInt(pullResult.dataChannels[0].id)
          console.log(`[Receiver] Creating Negotiated Channel on ID: ${channelId}`)

          const dc = session.peerConnection.createDataChannel(data.channelName, {
            negotiated: true,
            id: channelId
          })

          // Setup Handlers
          console.log(`[Receiver] DC created. State: ${dc.readyState}`)

          dc.onopen = () => {
            console.log('[Receiver] Channel OPEN!')
            toast.success('Receiver Connected!')
          }
          dc.onmessage = async (msgEvent) => {
            console.log('[Receiver] Message received:', msgEvent)
            const data = msgEvent.data
            // Try handling as file transfer first
            const savedPath = await container.fileTransferService.handleIncomingData(data)

            if (savedPath) {
              toast.success(`File received: ${savedPath.split('/').pop()}`)
              console.log('File saved at', savedPath)
            } else if (typeof data === 'string') {
              // Check if it's NOT a file protocol message
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'FILE_START') return // handled by service
              } catch {
                // Plain text message
                console.log('[Receiver] Message:', data)
                toast.message(`Received: ${data}`)
              }
            }
          }
          dc.onerror = (e) => console.error('[Receiver] DC Error:', e)
          dc.onclose = () => console.log('[Receiver] DC Closed')

          // Diagnostic Loop
          const diagInterval = setInterval(() => {
            console.log(
              `[Receiver DIAG] ICE: ${session.peerConnection.iceConnectionState} | DC: ${dc.readyState} | ID: ${dc.id}`
            )
            if (dc.readyState === 'closed' || session.peerConnection.connectionState === 'closed') {
              clearInterval(diagInterval)
            }
          }, 2000)

          // Force check if already open
          if (dc.readyState === 'open') {
            dc.onopen(new Event('open'))
          }
        } else {
          console.warn(
            '[Receiver] No data channel ID returned from Cloudflare. Cannot establish connection.'
          )
          toast.error('Connection Failed: No Channel ID')
        }
      } catch (err) {
        console.error('[Receiver] Setup failed:', err)
        toast.error('Receiver Connection Failed')
      }
    }

    container.eventBus.on('webrtc.datachannel.received', handleDataChannelReceived)
    return () => {
      container.eventBus.off('webrtc.datachannel.received', handleDataChannelReceived)
    }
  }, [account, conversation])

  // -- RENDER --
  return (
    <div
      className="h-14 flex items-center py-2 gap-3 sticky w-full z-10 px-3 bg-white/40 text-black shadow border-app cursor-pointer hover:bg-white/60 transition-colors"
      style={{ top: 'var(--header-height)' }}
    >
      <span className="h-full w-[3px] rounded-md bg-black"></span>
      <div className="h-full flex-1 flex items-center gap-2">
        <div className="flex-1" onClick={connectWebRTC}>
          <div className="text-base font-bold flex-1 line-clamp-1 break-all">
            {t('pinnedMessage')}
          </div>
          <div className="flex-1 text-sm font-medium break-all text-black/60 line-clamp-1 break-all">
            Click to Connect / Check logs for status.
          </div>
        </div>
        <PinIcon className="shrink-0 size-5" />
      </div>
    </div>
  )
}

export default React.memo(PinMessages)
