import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { memo } from 'react'

export type DiscardRecordingModalProps = {}

export const DiscardRecordingModal = memo(({}: DiscardRecordingModalProps) => {
  const discardRecording = useUiStore((s) => s.discardRecording)
  return (
    <Dialog open={discardRecording}>
      <DialogContent className="text-white bg-black/30">
        <p className="text-lg font-bold">Discard Voice Message</p>
        <p>Are you sure to stop recording and discard your voice message?</p>
        <div className="flex flex-row text-black gap-5 w-full justify-end text-blue-400">
          <button
            onClick={() => {
              uiActions.setDiscardRecording(false)
            }}
          >
            Continue
          </button>
          <button
            onClick={() => {
              uiActions.setMicOpen(false)
              uiActions.setDiscardRecording(false)
            }}
          >
            Discard
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
})
