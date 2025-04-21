import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload, type TypedLocale } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { Card, type CardDocumentData, type CardPostData } from '@/components/Card'
import { getTranslations } from 'next-intl/server'

type Args = {
  searchParams: Promise<{
    q: string
  }>
  params: Promise<{
    locale: TypedLocale
  }>
}
export default async function Page({
  searchParams: searchParamsPromise,
  params: paramsPromise,
}: Args) {
  const { q: query } = await searchParamsPromise
  const { locale } = await paramsPromise
  const t = await getTranslations()
  const payload = await getPayload({ config: configPromise })

  const items = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    locale,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      doc: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">{t('search')}</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {items.totalDocs > 0 ? (
        <div className="container">
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
            {items.docs?.map((result) => {
              if (typeof result === 'object' && result !== null) {
                return (
                  <div className="col-span-4" key={result.slug}>
                    <Card
                      className="h-full"
                      doc={result as CardPostData | CardDocumentData}
                      showCategories
                      relationTo={result.doc.relationTo}
                    />
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      ) : (
        <div className="container">{t('no-results')}</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Search | The Novine',
  }
}
