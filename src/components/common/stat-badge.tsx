import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatBadgeProps {
  label: string
  value: string | number
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}

export function StatBadge({ label, value, variant = 'secondary', className }: StatBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span>{label}</span>
      <Badge variant={variant} className="font-mono">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Badge>
    </div>
  )
}



