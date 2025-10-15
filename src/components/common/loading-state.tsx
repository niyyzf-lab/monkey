import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingState({ 
  title = "正在加载", 
  description = "请稍候...", 
  className 
}: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <div className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-muted-foreground/10" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}



