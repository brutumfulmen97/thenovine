import configPromise from '@payload-config'
import { getPayload, type TypedLocale } from 'payload'
import { redirect } from '@/i18n/routing'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{
    locale: TypedLocale
  }>
}

export default async function Page({ params }: Args) {
  const { locale } = await params

  const payload = await getPayload({ config: configPromise })

  const documents = await payload.find({
    collection: 'documents',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    locale,
    select: {
      topic: true,
      slug: true,
    },
  })

  const doc = documents.docs[0]

  if (!doc) {
    return redirect({ href: '/', locale })
  }

  return redirect({ href: `/documents/${doc.topic}/${doc.slug}`, locale })
}
