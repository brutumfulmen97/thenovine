import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context, i18n },
}) => {
  let locale = i18n?.language
  if (locale === 'en') locale = ''

  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = doc.slug === 'home' ? `/${locale}` : `/${locale ? `${locale}/` : ''}${doc.slug}`

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      revalidateTag('pages-sitemap')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath =
        previousDoc.slug === 'home'
          ? `/${locale}`
          : `/${locale ? `${locale}/` : ''}${previousDoc.slug}`

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('pages-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({
  doc,
  req: { context, i18n },
}) => {
  let locale = i18n?.language
  if (locale === 'en') locale = ''

  if (!context.disableRevalidate) {
    const path = doc?.slug === 'home' ? `/${locale}` : `/${locale ? `${locale}/` : ''}${doc?.slug}`
    revalidatePath(path)
    revalidateTag('pages-sitemap')
  }

  return doc
}
