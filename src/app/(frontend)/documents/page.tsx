import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
// import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const documents = await payload.find({
    collection: 'documents',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      {/* <PageClient /> */}
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Documents</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="documents"
          currentPage={documents.page}
          limit={12}
          totalDocs={documents.totalDocs}
        />
      </div>

      <CollectionArchive items={documents.docs} relationTo="documents" />

      <div className="container">
        {documents.totalPages > 1 && documents.page && (
          <Pagination page={documents.page} totalPages={documents.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'The Novine Documents',
  }
}
