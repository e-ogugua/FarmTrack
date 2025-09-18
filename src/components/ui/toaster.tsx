'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Toast, ToastProvider } from '@/components/ui/toast'

export function Toaster() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ToastProvider>
      <Toast
        className={`${theme === 'dark' ? 'dark' : ''} fixed top-4 right-4 z-50`}
      />
    </ToastProvider>
  )
}
