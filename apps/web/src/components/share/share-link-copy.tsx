'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = { token: string }

export function ShareLinkCopy({ token }: Props) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/shared/${token}`

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <Input value={url} readOnly className="flex-1 text-xs" />
      <Button variant="outline" size="sm" onClick={copy} className="cursor-pointer shrink-0">
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </Button>
    </div>
  )
}
