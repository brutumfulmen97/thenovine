import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Document } from '@/payload-types'

export const revalidateDocument: CollectionAfterChangeHook<Document> = ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    if (doc._status === 'published') {
      revalidatePath('/(frontend)/[locale]/documents/[topic]/[slug]', 'page')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Document> = ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    if (doc._status === 'published') {
      revalidatePath('/(frontend)/[locale]/documents/[topic]/[slug]', 'page')
      revalidateTag('document-sitemap')
    }
  }

  return doc
}
