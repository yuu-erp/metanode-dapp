'use client'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeSession } from '../../../modules/realtime-transport'

export type TransferStatus = 'idle' | 'preparing' | 'sending' | 'receiving' | 'completed' | 'error'

export function useFileTransfer(
  account: Account | undefined,
  conversation: Conversation | null | undefined
) {
  const [status, setStatus] = useState<TransferStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const workerRef = useRef<Worker | null>(null)
  const sessionRef = useRef<RealtimeSession | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)

  // Initialize Worker
  useEffect(() => {
    console.log('[useFileTransfer] Initializing worker...')
    workerRef.current = new Worker(
      new URL('../../../modules/file-transfer/workers/file-transfer.worker.ts', import.meta.url)
    )

    workerRef.current.onmessage = async (e) => {
      const { type, chunk, progress: p, buffer, fileName } = e.data

      switch (type) {
        case 'CHUNK_READY':
          if (dataChannelRef.current?.readyState === 'open') {
            dataChannelRef.current.send(chunk)
            setProgress(p)

            // Flow control: wait for buffer to drain if needed
            if (dataChannelRef.current.bufferedAmount > 1024 * 1024) {
              console.log('[useFileTransfer] Buffer full, pausing worker...')
            } else {
              workerRef.current?.postMessage({ type: 'NEXT_CHUNK' })
            }
          }
          break

        case 'SEND_COMPLETE':
          console.log('[useFileTransfer] Sending complete, signaling EOF')
          if (dataChannelRef.current?.readyState === 'open') {
            dataChannelRef.current.send('EOF')
          }
          setStatus('completed')
          setProgress(100)
          break

        case 'RECEIVED_COMPLETE':
          console.log('[useFileTransfer] Receiving complete, saving to local storage')
          try {
            const filePath = await container.fileTransferService.saveReceivedFile(fileName, buffer)
            console.log(`[useFileTransfer] File saved successfully at: ${filePath}`)
            setStatus('completed')
            setProgress(100)

            // Emit event for UI to update (if needed)
            container.eventBus.emit('message.file.downloaded', {
              fileId: dataChannelRef.current?.label || 'unknown',
              filePath
            })
          } catch (err) {
            console.error('[useFileTransfer] Failed to save received file:', err)
            setError('Failed to save file locally')
            setStatus('error')
          }
          break
      }
    }

    return () => {
      console.log('[useFileTransfer] Terminating worker')
      workerRef.current?.terminate()
    }
  }, [])

  // Listen for incoming DataChannel events via SMC
  useEffect(() => {
    if (!account || !conversation) return

    const handleDataChannel = async (data: any) => {
      console.log('[useFileTransfer] Inbound DataChannel signal detected from SMC', data)
      try {
        let channelLabel = data.channelName
        let metadata: any = null

        if (data.channelName.startsWith('{')) {
          try {
            metadata = JSON.parse(data.channelName)
            channelLabel = metadata.label
          } catch (e) {
            console.error('[useFileTransfer] Failed to parse encoded channelName', e)
          }
        }

        setStatus('receiving')
        // Create session to receive
        const session = await container.sessionManager.createSession({
          participantId: account.address,
          conversationId: conversation.conversationId,
          connectionType: 'receive'
        })
        sessionRef.current = session

        // 1. Listen for the actual data channel joining FIRST
        container.transportService.onRemoteDataChannel(session, (event) => {
          console.log(
            `[useFileTransfer] Remote DataChannel joined: "${event.channel.label}" (expected: "${channelLabel}")`
          )
          const dc = event.channel
          if (dc.label === channelLabel) {
            dc.binaryType = 'arraybuffer'
            dataChannelRef.current = dc
            dc.onmessage = (msg) => {
              if (typeof msg.data === 'string' && msg.data === 'EOF') {
                console.log('[useFileTransfer] EOF received from partner')
                workerRef.current?.postMessage({
                  type: 'FINISH_RECEIVE',
                  fileName: metadata?.fileName || 'received_file',
                  fileType: metadata?.fileType || 'application/octet-stream'
                })
              } else {
                workerRef.current?.postMessage({ type: 'RECEIVE_CHUNK', chunk: msg.data })
              }
            }
          }
        })

        // 2. Pull the specific data channel (triggers renegotiation)
        await container.transportService.pullDataChannel(session, data.sessionId, channelLabel)
      } catch (err) {
        console.error('[useFileTransfer] Failed to handle incoming channel:', err)
        setError('Failed to connect for file transfer')
        setStatus('error')
      }
    }

    container.eventBus.on('webrtc.datachannel.received', handleDataChannel)

    return () => {
      container.eventBus.off('webrtc.datachannel.received', handleDataChannel)
    }
  }, [account, conversation])

  const sendFile = useCallback(
    async (file: File) => {
      if (!account || !conversation) return

      try {
        console.log('[useFileTransfer] Starting file send process for:', file.name)
        setStatus('preparing')
        setError(null)

        // 1. Create WebRTC Session
        const session = await container.sessionManager.createSession({
          participantId: account.address,
          conversationId: conversation.conversationId,
          connectionType: 'send'
        })
        sessionRef.current = session

        // 2. Create Data Channel
        const channelName = `file-${Date.now()}`
        const dc = await container.transportService.createDataChannel(session, channelName)
        dataChannelRef.current = dc

        dc.onopen = () => {
          setStatus('sending')
          workerRef.current?.postMessage({ type: 'START_SEND', file })
        }

        dc.onbufferedamountlow = () => {
          workerRef.current?.postMessage({ type: 'NEXT_CHUNK' })
        }
        dc.bufferedAmountLowThreshold = 65536 // 64KB trigger

        // 3. Notify partner via SMC (for fast signaling)
        // We encode metadata into channelName because the contract ABI only permits 3 arguments
        const encodedChannelName = JSON.stringify({
          label: channelName,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream'
        })

        await container.userContract.sendDataChannel({
          from: account.address,
          to: account.contractAddress,
          inputData: {
            _recipientContractAddress: conversation.conversationId,
            sessionId: session.sessionId,
            channelName: encodedChannelName
          }
        })

        // 4. Send persistent message to blockchain
        await container.messageService.sendMessage(account, conversation, {
          type: 'file',
          fileName: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          fileId: channelName
        })
      } catch (err) {
        console.error('[useFileTransfer] Failed to initiate transfer:', err)
        setError('Failed to start file transfer')
        setStatus('error')
      }
    },
    [account, conversation]
  )

  return {
    sendFile,
    status,
    progress,
    error
  }
}
