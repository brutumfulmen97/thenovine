import type { CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  documents: '/documents',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  topic?: string
  locale: string
}

export const generatePreviewPath = ({ collection, slug, topic, locale }: Props) => {
  if (locale === 'en') locale = ''

  const path = `${locale ? `/${locale}` : ''}${collectionPrefixMap[collection]}/${topic !== '' && topic ? `${topic}/` : ''}${slug}`

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
