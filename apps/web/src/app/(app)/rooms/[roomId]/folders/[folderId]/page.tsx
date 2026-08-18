import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ExplorerBreadcrumb } from '@/components/explorer/breadcrumb'
import { ExplorerServer } from '@/components/explorer/explorer-server'

type Props = { params: Promise<{ roomId: string; folderId: string }> }

export default async function FolderPage({ params }: Props) {
  const { roomId, folderId } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/folders/${folderId}/contents`,
    {
      method: 'QUERY',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 50 }),
      cache: 'no-store',
    },
  )
  if (!res.ok) notFound()
  const data = await res.json()

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <ExplorerBreadcrumb roomId={roomId} crumbs={data.breadcrumb ?? []} />
      </div>
      <ExplorerServer roomId={roomId} folderId={folderId} token={session.access_token} initialData={data} dataRoomId={data.folder.dataRoomId} />
    </div>
  )
}
