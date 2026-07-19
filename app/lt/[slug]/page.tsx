import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { apiFetch, ApiError } from '@/lib/api'
import type { PublicLinkTreeResponse } from '@/lib/types'
import { LinkTreePublicView } from '@/components/linktree/LinkTreePublicView'

async function getLinkTree(slug: string): Promise<PublicLinkTreeResponse | null> {
  try {
    return await apiFetch<PublicLinkTreeResponse>(`/api/linktrees/${slug}`, null)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const linkTree = await getLinkTree(slug)
  if (!linkTree) return {}
  return { title: `${linkTree.treeName} — ${linkTree.creatorName} — NipNip` }
}

export default async function LinkTreeSlugPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const linkTree = await getLinkTree(slug)
  if (!linkTree) notFound()

  return <LinkTreePublicView linkTree={linkTree} />
}
