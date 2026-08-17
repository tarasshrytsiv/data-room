'use client'

import { useRef, useState } from 'react'
import { Upload, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useUpload } from '@/hooks/use-upload'
import { UploadQueue } from '@/components/upload/upload-queue'
import { apiFetch } from '@/lib/api'
import type { FolderDto } from '@repo/types'

type Props = { roomId: string; folderId: string | null; onRefresh: () => void; dataRoomId: string }

export function ExplorerToolbar({ folderId, onRefresh, dataRoomId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { items, upload } = useUpload(folderId ?? '', onRefresh)
  const [folderDialog, setFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [creating, setCreating] = useState(false)

  async function createFolder() {
    if (!folderName.trim()) return
    setCreating(true)
    await apiFetch<FolderDto>('/folders', {
      method: 'POST',
      body: JSON.stringify({
        name: folderName.trim(),
        dataRoomId,
        ...(folderId ? { parentId: folderId } : {}),
      }),
    })
    setFolderDialog(false)
    setFolderName('')
    setCreating(false)
    onRefresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => inputRef.current?.click()}>
        <Upload size={14} className="mr-2" />
        Upload
      </Button>
      <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setFolderDialog(true)}>
        <FolderPlus size={14} className="mr-2" />
        New folder
      </Button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) upload(files)
          e.target.value = ''
        }}
        aria-label="Upload PDF files"
      />

      <Dialog open={folderDialog} onOpenChange={setFolderDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFolderDialog(false)} className="cursor-pointer">Cancel</Button>
              <Button onClick={createFolder} disabled={creating || !folderName.trim()} className="cursor-pointer">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UploadQueue items={items} />
    </div>
  )
}
