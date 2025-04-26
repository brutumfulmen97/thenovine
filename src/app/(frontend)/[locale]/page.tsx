import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload, type TypedLocale } from 'payload'
import { cache } from 'react'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import PageClient from './[slug]/page.client'
import { RenderHero } from '@/heros/RenderHero'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import type { Metadata } from 'next'
import { InstallPrompt, PushNotificationManager } from '@/components/pwa/PWA'

type Args = {
  params: Promise<{
    slug?: string
    locale: TypedLocale
  }>
}

export default async function Page({ params }: Args) {
  const { slug = 'home', locale = 'en' } = await params

  const url = `/${locale}/${slug}`

  const page = await queryPage({
    locale,
    slug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      <RenderHero {...hero} />
      <div className="container py-4">
        <PushNotificationManager />
        <InstallPrompt />
      </div>
      <RenderBlocks blocks={layout} locale={locale} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale = 'en', slug = 'home' } = await params
  const page = await queryPage({
    locale,
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPage = cache(async ({ locale, slug }: { locale: TypedLocale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
