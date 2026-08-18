import { notFound } from 'next/navigation'
import { ReadonlyItemGrid } from '@/components/explorer/readonly-item-grid'
import { createClient } from '@/lib/supabase/server'
import type { ShareDto, FolderContentsResponse } from '@repo/types'

type Props = { params: Promise<{ token: string }> }

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session?.access_token) return {}
  return { Authorization: `Bearer ${data.session.access_token}` }
}

async function getSharedContent(token: string, authHeader: Record<string, string>) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shared/${token}`,
    { cache: 'no-store', headers: authHeader },
  )
  if (!res.ok) return null
  return res.json() as Promise<{ share: ShareDto; isReadOnly: true; viewUrl: string | null }>
}

export default async function SharedPage({ params }: Props) {
  const { token } = await params
  const authHeader = await getAuthHeader()
  const data = await getSharedContent(token, authHeader)

  if (!data) notFound()

  const { share, viewUrl } = data

  if (share.fileId) {
    if (!viewUrl) notFound()

    return (
      <div className="flex flex-col h-screen">
        <div className="px-4 py-3 border-b bg-white flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">Data Room — Shared file</span>
        </div>
        <iframe src={viewUrl} className="flex-1 w-full" title="Shared file" />
      </div>
    )
  }

  const contentsRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shared/${token}/contents`,
    { method: 'QUERY', headers: { 'Content-Type': 'application/json', ...authHeader }, body: '{}', cache: 'no-store' },
  )

  const contents = contentsRes.ok
    ? (await contentsRes.json()) as FolderContentsResponse
    : null

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Shared with you · read only</p>
        <h1 className="text-xl font-bold text-[var(--color-foreground)]">
          {share.dataRoomId ? 'Data Room' : 'Folder'}
        </h1>
      </div>

      {contents && contents.items.length > 0 ? (
        <ReadonlyItemGrid items={contents.items} token={token} />
      ) : (
        <p className="text-sm text-[var(--color-muted-foreground)]">Empty</p>
      )}
    </div>
  )
}
