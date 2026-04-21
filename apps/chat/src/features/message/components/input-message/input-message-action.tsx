'use client'

import * as React from 'react'
import {
  InputMessageActionView,
  useBuildMessageActionViewData,
  type InputMessageActionProps
} from '.'

function InputMessageAction({ messageAction, onClearAction }: InputMessageActionProps) {
  if (!messageAction) return null
  // FORWARD xử lý riêng (drawer)
  if (messageAction.type === 'FORWARD') return null
  const viewData = useBuildMessageActionViewData(messageAction)
  if (!viewData) return null
  return (
    <InputMessageActionView
      title={viewData.title}
      onClose={onClearAction}
      messageAction={messageAction}
    />
  )
}

export default React.memo(InputMessageAction)
