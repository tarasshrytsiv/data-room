import { createClient } from '@/lib/supabase/server'
import { RoomCard } from '@/components/data-room/room-card'
import { CreateRoomDialog } from '@/components/data-room/create-room-dialog'
import type { DataRoomDto } from '@repo/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/data-rooms`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
    cache: 'no-store',
  })
  const rooms: DataRoomDto[] = res.ok ? await res.json() : []

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--color-foreground)]">Data Rooms</h1>
        <CreateRoomDialog />
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[var(--color-muted-foreground)] text-sm">No Data Rooms yet</p>
          <p className="text-[var(--color-muted-foreground)] text-xs mt-1">Create one to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
