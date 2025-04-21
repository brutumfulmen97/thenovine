import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Document } from '@/payload-types'

export const revalidateDocument: CollectionAfterChangeHook<Document> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/documents/${doc.topic}/${doc.slug}`

      payload.logger.info(`Revalidating document at path: ${path}`)

      revalidatePath(path)
      revalidateTag('document-sitemap')
    }

    // If the document was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/documents/${previousDoc.topic}/${previousDoc.slug}`

      payload.logger.info(`Revalidating old document at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('document-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Document> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/documents/${doc.topic}/${doc.slug}`

    revalidatePath(path)
    revalidateTag('document-sitemap')
  }

  return doc
}
