'use client'

import type { TopicGroupForNav } from '@/app/(frontend)/[locale]/documents/[topic]/[slug]/page'
import { Fragment, useEffect, useRef, useState } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { Link } from '@/i18n/routing'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utilities/ui'

const openTopicsLocalStorageKey = 'docs-open-topics'

type Props = {
  currentDoc: string
  currentTopic: string
  docIndex: number
  groupIndex: number
  indexInGroup: number
  topics: TopicGroupForNav[]
}

export const DocsNavigation = ({
  currentDoc,
  currentTopic,
  docIndex,
  groupIndex,
  indexInGroup,
  topics,
}: Props) => {
  const [currentTopicIsOpen, setCurrentTopicIsOpen] = useState(true)
  const [openTopicPreferences, setOpenTopicPreferences] = useState<string[]>()
  const [init, setInit] = useState(false)
  const [resetIndicator, setResetIndicator] = useState(false)
  const [defaultIndicatorPosition] = useState<number | undefined>(undefined)
  const [indicatorTop, setIndicatorTop] = useState<number | undefined>(undefined)

  const topicRefs = useRef<Record<string, HTMLButtonElement | HTMLLIElement | null>>({})

  useEffect(() => {
    const preference = window.localStorage.getItem(openTopicsLocalStorageKey)
    if (preference) {
      setOpenTopicPreferences(JSON.parse(preference))
    } else {
      setOpenTopicPreferences([currentTopic])
    }
  }, [currentTopic])

  useEffect(() => {
    if (openTopicPreferences && !init) {
      setInit(true)
    }
  }, [openTopicPreferences, init])

  useEffect(() => {
    resetDefaultIndicator()
  }, [currentTopic, currentDoc])

  useEffect(() => {
    if (init) {
      const formattedIndex =
        typeof docIndex === 'number' ? `${groupIndex}-${indexInGroup}-${docIndex}` : groupIndex
      const offset = topicRefs?.current[formattedIndex]?.offsetTop || 0
      setIndicatorTop(offset)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init])

  const resetDefaultIndicator = () => {
    const formattedIndex =
      typeof docIndex === 'number' ? `${groupIndex}-${indexInGroup}-${docIndex}` : groupIndex
    const defaultIndicatorPosition = topicRefs?.current[formattedIndex]?.offsetTop || 0
    setIndicatorTop(defaultIndicatorPosition)
  }

  const handleMenuItemClick = (topicSlug: string) => {
    const isCurrentTopic = currentTopic === topicSlug
    if (isCurrentTopic) {
      if (openTopicPreferences?.includes(topicSlug) && currentTopicIsOpen) {
        const newState = [...openTopicPreferences]
        newState.splice(newState.indexOf(topicSlug), 1)

        setOpenTopicPreferences(newState)
        window.localStorage.setItem(openTopicsLocalStorageKey, JSON.stringify(newState))
      }
      setCurrentTopicIsOpen((state) => !state)
    } else {
      const newState = [...(openTopicPreferences || [])]

      if (!newState.includes(topicSlug)) {
        newState.push(topicSlug)
      } else {
        newState.splice(newState.indexOf(topicSlug), 1)
      }
      setOpenTopicPreferences(newState)
      window.localStorage.setItem(openTopicsLocalStorageKey, JSON.stringify(newState))
    }
  }

  const handleIndicator = (index: number | string) => {
    const offset = topicRefs?.current[index]?.offsetTop || 0
    setIndicatorTop(offset)
  }

  useEffect(() => {
    if (resetIndicator) {
      resetDefaultIndicator()
      setResetIndicator(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetIndicator])

  const isActiveTopic = (topic: string) => topic === currentTopic
  const isActiveDoc = (topic: string, doc: string) => topic === currentTopic && doc === currentDoc

  return (
    <aside className="border-neutral-600 border-1 px-4 relative w-xs">
      <nav className="" onMouseLeave={() => setResetIndicator(true)}>
        <Accordion.Root
          onValueChange={(value) => {
            // We only want to have one topic open at a time,
            // so we'll always set the last value in the array
            const newValue =
              Array.isArray(value) && value.length > 0 ? [value[value.length - 1]] : value
            window.localStorage.setItem(openTopicsLocalStorageKey, JSON.stringify(newValue))
            setOpenTopicPreferences(newValue as string[])
          }}
          type="multiple"
          value={openTopicPreferences}
          className="mb-4"
        >
          {topics.map((tGroup, groupIndex) => (
            <Fragment key={`group-${groupIndex}`}>
              <h4 className="font-bold text-lg mt-4">{tGroup.groupLabel}</h4>
              {tGroup.topics.map(
                (topic, index) =>
                  topic && (
                    <Accordion.Item key={topic.slug} value={topic.slug.toLowerCase()} className="">
                      <Accordion.Trigger
                        className={cn(
                          'text-neutral-400 font-semibold flex items-center gap-2 group my-1 w-full hover:text-primary',
                          isActiveTopic(topic.slug.toLowerCase()) && 'text-primary',
                        )}
                        onClick={() => handleMenuItemClick(topic.slug.toLowerCase())}
                        onMouseEnter={() => handleIndicator(`${groupIndex}-${index}`)}
                        ref={(ref) => {
                          topicRefs.current[`${groupIndex}-${index}`] = ref
                        }}
                      >
                        {(topic.title || topic.slug)?.replace('-', ' ')}
                        <ChevronDown
                          aria-hidden
                          className="group-hover:-rotate-90 group-hover:block group-aria-expanded:block hidden transition-transform"
                          size={16}
                        />
                      </Accordion.Trigger>
                      <Accordion.Content asChild>
                        <ul className="pl-4">
                          {topic.docs.map((doc, docIndex) => {
                            const nestedIndex = `${groupIndex}-${index}-${docIndex}`
                            return (
                              doc && (
                                <Link
                                  href={`/documents/${topic.slug.toLowerCase()}/${doc.slug}`}
                                  key={`${topic.slug}_${doc.slug}`}
                                  prefetch={false}
                                >
                                  <li
                                    className={cn(
                                      'text-neutral-400 font-semibold hover:text-primary',
                                      isActiveDoc(topic.slug.toLowerCase(), doc.slug ?? '')
                                        ? 'text-primary'
                                        : '',
                                    )}
                                    onMouseEnter={() => handleIndicator(nestedIndex)}
                                    ref={(ref) => {
                                      topicRefs.current[nestedIndex] = ref
                                    }}
                                  >
                                    {doc.title}
                                  </li>
                                </Link>
                              )
                            )
                          })}
                        </ul>
                      </Accordion.Content>
                    </Accordion.Item>
                  ),
              )}
              {groupIndex < topics.length - 1 && <div className="" />}
            </Fragment>
          ))}
        </Accordion.Root>
        {indicatorTop || defaultIndicatorPosition ? (
          <div
            className="absolute left-0 top-0 transition-all h-6 bg-white w-[2px]"
            style={{ top: indicatorTop || defaultIndicatorPosition }}
          />
        ) : null}
      </nav>
    </aside>
  )
}
