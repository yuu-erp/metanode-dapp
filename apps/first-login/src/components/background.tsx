'use client'

import * as React from 'react'

function Background() {
  const orb1Ref = React.useRef<HTMLDivElement>(null)
  const orb2Ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let start = performance.now()
    let rafId: number

    const animate = (time: number) => {
      const t = (time - start) / 1000

      const w = window.innerWidth
      const h = window.innerHeight

      // Orb 1 – vòng tròn lớn, chậm
      const x1 = w / 2 + Math.cos(t * 0.25) * w * 0.35
      const y1 = h / 2 + Math.sin(t * 0.25) * h * 0.35

      // Orb 2 – vòng tròn nhỏ, nhanh hơn
      const x2 = w / 2 + Math.cos(-t * 0.4) * w * 0.25
      const y2 = h / 2 + Math.sin(-t * 0.4) * h * 0.25

      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${x1}px, ${y1}px)`
      }

      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${x2}px, ${y2}px)`
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2b155f] via-[#060b1a] to-[#041b22]" />

      {/* Orb 1 */}
      <div
        ref={orb1Ref}
        className="
          absolute
          -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px]
          rounded-full
          bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.35),transparent_65%)]
          blur-3xl
        "
      />

      {/* Orb 2 */}
      <div
        ref={orb2Ref}
        className="
          absolute
          -translate-x-1/2 -translate-y-1/2
          w-[500px] h-[500px]
          rounded-full
          bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_65%)]
          blur-3xl
        "
      />
    </div>
  )
}

export default React.memo(Background)
