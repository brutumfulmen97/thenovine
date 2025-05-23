'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type FC, useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export const Search: FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const t = useTranslations()

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          {t('search')}
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder={t('search')}
        />
        <button type="submit" className="sr-only">
          {t('submit')}
        </button>
      </form>
    </div>
  )
}
