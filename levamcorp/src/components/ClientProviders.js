'use client'
import dynamic from 'next/dynamic'

const LightingProvider = dynamic(() => import('./LightingProvider'), { ssr: false })
const ScrollAnimations  = dynamic(() => import('./ScrollAnimations'),  { ssr: false })

export default function ClientProviders() {
  return (
    <>
      <LightingProvider/>
      <ScrollAnimations/>
    </>
  )
}
