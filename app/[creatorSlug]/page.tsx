import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { apiFetch, ApiError } from '@/lib/api'
import type { PublicLinkTreeResponse } from '@/lib/types'
import { LinkTreePublicView } from '@/components/linktree/LinkTreePublicView'

async function getLinkTree(creatorSlug: string): Promise<PublicLinkTreeResponse | null> {
  try {
    return await apiFetch<PublicLinkTreeResponse>(`/api/linktrees/by-creator/${creatorSlug}`, null)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ creatorSlug: string }> }
): Promise<Metadata> {
  const { creatorSlug } = await params
  const linkTree = await getLinkTree(creatorSlug)
  if (!linkTree) return {}
  return { title: `${linkTree.creatorName} — NipNip` }
}

export default async function CreatorLinkTreePage(
  { params }: { params: Promise<{ creatorSlug: string }> }
) {
  const { creatorSlug } = await params
  const linkTree = await getLinkTree(creatorSlug)
  if (!linkTree) notFound()

  return <LinkTreePublicView linkTree={linkTree} />
}
