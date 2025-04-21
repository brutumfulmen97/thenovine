import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const documents = await payload.find({
    collection: 'documents',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = documents.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Document({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = `/documents/${slug}`
  const document = await queryDocumentBySlug({ slug })

  if (!document) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="flex flex-col items-center gap-4 pt-8">
        <h1 className="text-4xl font-bold">{document.title}</h1>
        <div className="container">
          <RichText
            className="max-w-[48rem] mx-auto"
            data={document.content}
            enableGutter={false}
          />
          {document.relatedPosts && document.relatedPosts.length > 0 && (
            <>
              <h2 className="text-2xl mt-12">Related Posts</h2>
              <RelatedPosts
                className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                docs={document.relatedPosts.filter((post) => typeof post === 'object')}
              />
            </>
          )}
          {document.relatedDocuments && document.relatedDocuments.length > 0 && (
            <>
              <h2 className="text-2xl mt-12">Related Documents</h2>
              <RelatedPosts
                className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                docs={document.relatedDocuments.filter((doc) => typeof doc === 'object')}
              />
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const document = await queryDocumentBySlug({ slug })

  return generateMeta({ doc: document })
}

const queryDocumentBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'documents',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
