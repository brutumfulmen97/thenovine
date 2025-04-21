import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context, i18n },
}) => {
  let locale = i18n?.language
  if (locale === 'en') locale = ''
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/${locale ? `${locale}/` : ''}posts/${doc.slug}`

      payload.logger.info(`Revalidating post at path: ${path}`)

      revalidatePath(path)
      revalidateTag('posts-sitemap')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/${locale ? `${locale}/` : ''}posts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('posts-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({
  doc,
  req: { context, i18n },
}) => {
  let locale = i18n?.language
  if (locale === 'en') locale = ''

  if (!context.disableRevalidate) {
    const path = `/${locale ? `${locale}/` : ''}posts/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('posts-sitemap')
  }

  return doc
}
