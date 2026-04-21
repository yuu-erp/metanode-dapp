'use client'
import * as React from 'react'

interface IconProps {
  className?: string
}
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  LeftIcon?: React.ComponentType<IconProps>
  RightIcon?: React.ComponentType<IconProps>
  className?: string
  label?: string
}

const InputBase = React.forwardRef<HTMLInputElement, InputProps>(() => {
  return <div className=""></div>
})

export default React.memo(InputBase)
