import { notFound } from 'next/navigation'
import { ItemGrid } from '@/components/explorer/item-grid'
import type { ShareDto, FolderContentsResponse } from '@repo/types'

type Props = { params: Promise<{ token: string }> }

async function getSharedContent(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shared/${token}`,
    { cache: 'no-store' },
  )
  if (!res.ok) return null
  return res.json() as Promise<{ share: ShareDto; isReadOnly: true }>
}

export default async function SharedPage({ params }: Props) {
  const { token } = await params
  const data = await getSharedContent(token)

  if (!data) notFound()

  const { share } = data

  if (share.fileId) {
    const fileRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/files/${share.fileId}/view-url`,
      { cache: 'no-store' },
    )
    if (!fileRes.ok) notFound()
    const { url } = await fileRes.json() as { url: string }

    return (
      <div className="flex flex-col h-screen">
        <div className="px-4 py-3 border-b bg-white flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">Data Room — Shared file</span>
        </div>
        <iframe src={url} className="flex-1 w-full" title="Shared file" />
      </div>
    )
  }

  const contentsRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shared/${token}/contents`,
    {
      method: 'QUERY',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 50 }),
      cache: 'no-store',
    },
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

      {contents ? (
        <ItemGrid
          items={contents.items}
          roomId=""
          onView={() => {}}
          onRefresh={() => {}}
          readOnly
        />
      ) : (
        <p className="text-sm text-[var(--color-muted-foreground)]">Empty</p>
      )}
    </div>
  )
}
