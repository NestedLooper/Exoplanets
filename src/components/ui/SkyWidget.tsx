'use client'

import { useEffect, useRef } from 'react'
import { planetSeed } from '@/lib/seed'

interface SkyWidgetProps {
  ra?: number | null
  dec?: number | null
  hostname: string
}

export function SkyWidget({ ra, dec, hostname }: SkyWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = 160, H = 160, cx = 80, cy = 80, r = 72

    ctx.clearRect(0, 0, W, H)

    // Dark sky bg
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    bg.addColorStop(0, '#0a0a20')
    bg.addColorStop(1, '#030310')
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = bg; ctx.fill()

    // Background stars seeded by hostname
    const _seed = planetSeed(hostname)
    for (let i = 0; i < 100; i++) {
      const s = planetSeed(`${hostname}-star-${i}`)
      const angle = ((s * 1664525 + 1013904223) & 0xffffffff) / 0xffffffff * Math.PI * 2
      const dist  = Math.sqrt(((s * 22695477 + 1) & 0xffffffff) / 0xffffffff) * r * 0.92
      const x = cx + Math.cos(angle) * dist
      const y = cy + Math.sin(angle) * dist
      const sz = ((s & 7) / 7) * 1.2 + 0.3
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180, 200, 255, ${0.2 + sz * 0.2})`; ctx.fill()
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(30, 30, 80, 0.7)'; ctx.lineWidth = 0.6
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, (i / 3) * r, 0, Math.PI * 2); ctx.stroke()
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke()
    }

    if (ra != null && dec != null) {
      const raRad  = (ra / 360) * Math.PI * 2
      const decRad = (dec / 90) * (Math.PI / 2)
      const dist2  = ((Math.PI / 2 - Math.abs(decRad)) / (Math.PI / 2)) * r * 0.92
      const kx = cx + Math.cos(raRad) * dist2 * (dec >= 0 ? 1 : -1)
      const ky = cy - Math.sin(raRad) * dist2 * (dec >= 0 ? 1 : -1)

      // Glow
      const glow = ctx.createRadialGradient(kx, ky, 0, kx, ky, 12)
      glow.addColorStop(0, 'rgba(255, 220, 80, 0.5)')
      glow.addColorStop(1, 'rgba(255, 220, 80, 0)')
      ctx.beginPath(); ctx.arc(kx, ky, 12, 0, Math.PI * 2)
      ctx.fillStyle = glow; ctx.fill()

      // Star dot
      ctx.beginPath(); ctx.arc(kx, ky, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#ffd060'; ctx.fill()

      // Crosshair
      ctx.strokeStyle = 'rgba(255, 210, 60, 0.5)'; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(kx - 8, ky); ctx.lineTo(kx + 8, ky); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(kx, ky - 8); ctx.lineTo(kx, ky + 8); ctx.stroke()
    }

    // Clip to circle + border
    ctx.save(); ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.restore()
    ctx.strokeStyle = '#1e1e4a'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }, [ra, dec, hostname])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} width={160} height={160} className="rounded-full" />
      {ra != null && dec != null && (
        <p className="text-xs text-slate-500">
          RA {ra.toFixed(2)}° · Dec {dec.toFixed(2)}°
        </p>
      )}
    </div>
  )
}
