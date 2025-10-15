import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
  delay?: number
}

export function SkeletonCard({ className, delay = 0 }: SkeletonCardProps) {
  return (
    <div 
      className={cn(
        "border rounded-lg p-4 bg-card space-y-3 animate-pulse",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded w-28 animate-shimmer" />
        <div className="h-5 bg-muted-foreground/10 rounded w-16" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted-foreground/10 rounded w-full" />
        <div className="h-4 bg-muted-foreground/10 rounded w-3/4" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-muted-foreground/10 rounded w-20" />
        <div className="h-6 bg-muted-foreground/10 rounded w-24" />
        <div className="h-6 bg-muted-foreground/10 rounded w-16" />
      </div>
    </div>
  )
}

interface SkeletonTagProps {
  className?: string
  delay?: number
}

export function SkeletonTag({ className, delay = 0 }: SkeletonTagProps) {
  return (
    <div 
      className={cn(
        "border rounded-lg p-3 bg-card space-y-2 animate-pulse",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded w-24" />
        <div className="h-5 w-8 bg-muted-foreground/10 rounded" />
      </div>
      <div className="h-3 bg-muted-foreground/10 rounded w-3/4" />
    </div>
  )
}

interface SkeletonCategoryProps {
  className?: string
  delay?: number
  width?: string
}

export function SkeletonCategory({ className, delay = 0, width }: SkeletonCategoryProps) {
  return (
    <div 
      className={cn(
        "h-8 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-md animate-pulse",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        width: width || `${60 + Math.random() * 40}px`
      }}
    />
  )
}
