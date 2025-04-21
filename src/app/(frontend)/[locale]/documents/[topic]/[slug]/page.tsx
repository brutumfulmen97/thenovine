import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderDocs } from '@/components/RenderDocs'
import type { Document } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload, type TypedLocale, type Payload } from 'payload'
import PageClient from './page.client'

export type TopicGroupForNav = {
  groupLabel: string
  topics: {
    title: string
    slug: string
    docs: Partial<Document>[]
  }[]
}

type Args = {
  params: Promise<{
    topic: string
    slug: string
    locale: TypedLocale
  }>
}

export default async function Page({ params }: Args) {
  const { topic, slug, locale = 'en' } = await params

  const payload = await getPayload({ config: configPromise })

  const currentDoc = await payload.find({
    collection: 'documents',
    limit: 1,
    pagination: false,
    locale,
    where: {
      slug: {
        equals: slug,
      },
      topic: {
        equals: topic,
      },
    },
  })

  const topicsForSidebar = await fetchTopicsForSidebar({ payload, locale })

  if (!currentDoc?.docs?.length) {
    return <PayloadRedirects url={`/${locale}/documents/${topic}/${slug}`} />
  }

  const doc = currentDoc.docs[0]

  return (
    <>
      <PageClient />
      <RenderDocs
        currentDoc={doc}
        docSlug={slug}
        topicGroups={topicsForSidebar}
        topicSlug={topic}
      />
    </>
  )
}

const fetchTopicsForSidebar = async ({
  payload,
  locale,
}: {
  payload: Payload
  locale: TypedLocale
}) => {
  const result = await payload.find({
    collection: 'documents',
    depth: 0,
    limit: 10000,
    pagination: false,
    locale,
    select: {
      slug: true,
      title: true,
      topic: true,
      topicGroup: true,
      content: true,
      relatedDocuments: true,
      relatedPosts: true,
    },
  })

  const { docs } = result

  const topicGroups = docs
    .reduce((acc, doc) => {
      if (!doc) return acc

      const { topic, topicGroup } = doc

      const group = acc.find((group) => group.groupLabel === topicGroup)
      if (!group) {
        acc.push({
          groupLabel: topicGroup,
          topics: [
            {
              title: topic,
              slug: topic,
              docs: [doc],
            },
          ],
        })
      } else if (group?.topics?.some((t) => t.slug === topic)) {
        group.topics.find((t) => t.slug === topic)?.docs.push(doc)
      } else {
        group?.topics.push({
          title: topic,
          slug: topic,
          docs: [doc],
        })
      }

      return acc
    }, [] as TopicGroupForNav[])
    .filter(Boolean)

  return topicGroups
}

export async function generateMetadata({ params }: Args) {
  const { topic, slug, locale } = await params
  const payload = await getPayload({ config: configPromise })
  const docs = await payload.find({
    collection: 'documents',
    depth: 0,
    pagination: false,
    locale,
    select: {
      description: true,
      title: true,
    },
    where: {
      slug: {
        equals: slug,
      },
      topic: {
        equals: topic,
      },
    },
  })

  const currentDoc = docs?.docs?.[0]

  return {
    description: currentDoc?.title || `The Novine ${topic} Documentation`,
    title: `${currentDoc?.title ? `${currentDoc.title} | ` : ''}Documentation | The Novine`,
  }
}

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const docs = await payload.find({
    collection: 'documents',
    depth: 0,
    limit: 10000,
    pagination: false,
    select: {
      slug: true,
      topic: true,
    },
  })

  const result: { doc: string; topic: string }[] = []

  for (const doc of docs.docs) {
    if (!doc.slug || !doc.topic || typeof doc.topic !== 'string' || typeof doc.slug !== 'string')
      continue
    result.push({
      doc: doc.slug ?? '',
      topic: doc.topic.toLowerCase(),
    })
  }

  return result
}
