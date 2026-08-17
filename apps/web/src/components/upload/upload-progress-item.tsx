import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { UploadItem } from '@/hooks/use-upload'

type Props = { item: UploadItem }

export function UploadProgressItem({ item }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        {item.status === 'done' && <CheckCircle size={16} className="text-emerald-500" />}
        {item.status === 'error' && <XCircle size={16} className="text-[var(--color-destructive)]" />}
        {(item.status === 'uploading' || item.status === 'pending') && (
          <Loader size={16} className="text-[var(--color-primary)] animate-spin" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-[var(--color-foreground)]">{item.file.name}</p>
        {item.status === 'error' && (
          <p className="text-xs text-[var(--color-destructive)]">{item.error}</p>
        )}
        {item.status === 'uploading' && (
          <Progress value={item.progress} className="h-1 mt-1" />
        )}
      </div>
      <span className="text-xs text-[var(--color-muted-foreground)] shrink-0">
        {item.status === 'uploading' ? `${item.progress}%` : item.status}
      </span>
    </div>
  )
}
