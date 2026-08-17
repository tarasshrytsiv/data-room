'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import type { DataRoomDto } from '@repo/types'

export function CreateRoomDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      await apiFetch<DataRoomDto>('/data-rooms', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      })
      setOpen(false)
      setName('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="cursor-pointer bg-[var(--color-accent)] hover:bg-orange-700 transition-colors duration-150 ease-out" />
        }
      >
        <Plus size={16} className="mr-2" />
        New Data Room
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Data Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="Data Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading || !name.trim()} className="cursor-pointer">
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
