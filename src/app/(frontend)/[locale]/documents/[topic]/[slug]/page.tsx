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
  const { topic, slug, locale } = await params

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

  const topicsForSidebar = await fetchTopicsForSidebar({ payload })

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

const fetchTopicsForSidebar = async ({ payload }: { payload: Payload }) => {
  const result = await payload.find({
    collection: 'documents',
    depth: 0,
    limit: 10000,
    pagination: false,
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
