import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExplorerBreadcrumb } from '@/components/explorer/breadcrumb'
import { ExplorerServer } from '@/components/explorer/explorer-server'

type Props = { params: Promise<{ roomId: string }> }

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const room = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/data-rooms/${roomId}`,
    { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' },
  ).then((r) => r.json())

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-foreground)] mb-2">{room.name}</h1>
        <ExplorerBreadcrumb roomId={roomId} crumbs={[]} />
      </div>
      <ExplorerServer roomId={roomId} folderId={null} token={session.access_token} />
    </div>
  )
}
