import type { TopicGroupForNav } from '@/app/(frontend)/[locale]/documents/[topic]/[slug]/page'
import { Link } from '@/i18n/routing'
import type { Document } from '@/payload-types'
import { notFound } from 'next/navigation'
import { DocsNavigation } from '../DocsNavigation'
import { Suspense } from 'react'
import RichText from '../RichText'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { ArrowRight } from 'lucide-react'

type Props = {
  children?: React.ReactNode
  currentDoc?: Document
  docSlug: string
  topicGroups: TopicGroupForNav[]
  topicSlug: string
}
export const RenderDocs = async ({
  children,
  currentDoc,
  docSlug,
  topicGroups,
  topicSlug,
}: Props) => {
  if (!currentDoc) {
    return notFound()
  }

  const groupIndex = topicGroups.findIndex(({ topics: tGroup }) =>
    tGroup.some((topic) => topic?.slug?.toLowerCase() === topicSlug.toLowerCase()),
  )

  const topicIndex =
    topicGroups[groupIndex]?.topics.findIndex(
      (topic) => topic?.slug?.toLowerCase() === topicSlug.toLowerCase(),
    ) ?? 0

  const topicGroup = topicGroups?.find(
    ({ groupLabel, topics }) =>
      topics.some((topic) => topic.slug.toLowerCase() === topicSlug) &&
      groupLabel === currentDoc.topicGroup,
  )

  if (!topicGroup) {
    throw new Error('Topic group not found')
  }

  const topic = topicGroup.topics.find((topic) => topic.slug.toLowerCase() === topicSlug)

  if (!topic) {
    throw new Error('Topic not found')
  }

  const docIndex = topic?.docs.findIndex((doc) => doc.slug === currentDoc.slug)

  const isLastGroup = topicGroups.length === groupIndex + 1
  const isLastTopic = topicGroup.topics.length === topicIndex + 1
  const isLastDoc = docIndex === topic.docs.length - 1

  const hasNext = !(isLastGroup && isLastTopic && isLastDoc)

  const nextGroupIndex = !isLastGroup && isLastTopic && isLastDoc ? groupIndex + 1 : groupIndex

  let nextTopicIndex: number

  if (!isLastDoc) {
    nextTopicIndex = topicIndex
  } else if (isLastDoc && !isLastTopic) {
    nextTopicIndex = topicIndex + 1
  } else {
    nextTopicIndex = 0
  }

  const nextDocIndex = !isLastDoc ? docIndex + 1 : 0

  const nextDoc = hasNext
    ? topicGroups[nextGroupIndex]?.topics?.[nextTopicIndex]?.docs[nextDocIndex]
    : null

  const next = hasNext
    ? {
        slug: nextDoc?.slug,
        title: nextDoc?.title,
        topic: topicGroups?.[nextGroupIndex]?.topics?.[nextTopicIndex]?.slug,
      }
    : null

  return (
    <div className="container flex">
      {children}
      <DocsNavigation
        currentDoc={docSlug}
        currentTopic={topicSlug}
        docIndex={docIndex}
        groupIndex={groupIndex}
        indexInGroup={topicIndex}
        topics={topicGroups}
      />
      <main className="grow flex flex-col border-1 border-neutral-700 border-l-0">
        <Suspense fallback={<DocSkeleton />}>
          {children}
          <article className="grow">
            <div className="flex flex-col items-center gap-4 pt-8">
              <h1 className="text-3xl font-bold">{currentDoc.title}</h1>
              <div className="container">
                <RichText
                  className="max-w-[48rem] mx-auto"
                  data={currentDoc.content}
                  enableGutter={false}
                />
                {currentDoc.relatedPosts && currentDoc.relatedPosts.length > 0 && (
                  <>
                    <h2 className="text-2xl mt-12">Related Posts</h2>
                    <RelatedPosts
                      className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                      docs={currentDoc.relatedPosts.filter((post) => typeof post === 'object')}
                    />
                  </>
                )}
                {currentDoc.relatedDocuments && currentDoc.relatedDocuments.length > 0 && (
                  <>
                    <h2 className="text-2xl mt-12">Related Documents</h2>
                    <RelatedPosts
                      className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                      docs={currentDoc.relatedDocuments.filter((doc) => typeof doc === 'object')}
                    />
                  </>
                )}
              </div>
            </div>
          </article>
        </Suspense>
        {next && (
          <Link
            className="p-8 bg-neutral-900 block w-full mt-12 group hover:bg-neutral-800 transition-colors border-t-1 border-neutral-700"
            data-algolia-no-crawl
            href={`/documents/${next?.topic?.toLowerCase()}/${next.slug}`}
            prefetch={false}
          >
            <div className="flex items-center gap-2">
              Next{' '}
              <ArrowRight
                size={20}
                className="-rotate-45 group-hover:-translate-y-1 transition-all"
              />
            </div>
            <h3 className="text-3xl font-bold">{next.title}</h3>
          </Link>
        )}
      </main>
    </div>
  )
}

const DocSkeleton = () => {
  return (
    <div className="space-y-4 grow">
      <div className="w-full animate-pulse h-12 bg-neutral-800" />
      <div className="w-full animate-pulse h-12 bg-neutral-800" />
      <div className="w-full animate-pulse h-12 bg-neutral-800" />
    </div>
  )
}
