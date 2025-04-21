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
    <div className="container">
      <h2>Something went wrong</h2>

      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
