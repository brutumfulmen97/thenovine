import type { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  documents: '/documents',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  topic?: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug, topic }: Props) => {
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: `${collectionPrefixMap[collection]}/${topic !== '' ? `${topic}/` : ''}${slug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
