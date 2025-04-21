'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

type TProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: TProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Something went wrong</h2>

      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
