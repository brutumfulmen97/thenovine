import { cn } from '@/utilities/ui'
import type React from 'react'

import { Card, type CardPostData } from '@/components/Card'

export type Props = {
  items: CardPostData[]
  relationTo: 'posts' | 'documents'
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { items, relationTo } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {items?.map((result) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={result.slug}>
                  <Card className="h-full" doc={result} showCategories relationTo={relationTo} />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
