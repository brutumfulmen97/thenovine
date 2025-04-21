'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'

import { routing, usePathname } from '@/i18n/routing'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function LanguageSwitcher() {
  const locale = useLocale()

  const [isPending, startTransition] = useTransition()

  const pathname = usePathname()
  const router = useRouter()

  const onValueChange = useCallback(
    (currentLocale: string) => {
      startTransition(() => {
        router.replace(`/${currentLocale}${pathname}`)
      })
    },
    [pathname, router],
  )

  // <Button
  //   key={lang}
  //   type="button"
  //   variant={lang === locale ? 'default' : 'outline'}
  //   size="sm"
  //   onClick={() => handleClick(lang)}
  //   className="py-1 uppercase h-9"
  //   disabled={isPending}
  // >
  //   {lang}
  // </Button>
  return (
    <Select onValueChange={onValueChange} value={locale}>
      <SelectTrigger
        aria-label="Select a theme"
        className="w-auto bg-transparent gap-2 pl-0 md:pl-3 border-none uppercase"
        disabled={isPending}
      >
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((lang) => (
          <SelectItem key={lang} value={lang} className="uppercase">
            {lang}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
