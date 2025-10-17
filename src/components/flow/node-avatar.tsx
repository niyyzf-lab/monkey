import { memo } from 'react'
import { cn } from '@/lib/utils'

interface NodeAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  className?: string
}

/**
 * 统一的节点头像组件
 * 用于 Flow 节点的图标展示，支持图片和 fallback
 */
function NodeAvatarComponent({
  src,
  alt = 'node icon',
  fallback,
  size = 'md',
  selected = false,
  className,
}: NodeAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const containerClasses = cn(
    'relative flex items-center justify-center rounded-full',
    'border-2 bg-background/95 backdrop-blur-sm',
    'transition-all duration-300',
    selected
      ? 'border-primary shadow-lg shadow-primary/20'
      : 'border-border shadow-md',
    'group-hover/node:border-primary/60 group-hover/node:shadow-lg group-hover/node:shadow-primary/10',
    sizeClasses[size],
    className
  )

  return (
    <div className={containerClasses}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover p-1"
          onError={(e) => {
            const target = e.currentTarget
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent && fallback) {
              parent.innerHTML = `<span class="text-[10px] font-semibold text-muted-foreground">${fallback}</span>`
            }
          }}
        />
      ) : fallback ? (
        <span className="text-[10px] font-semibold text-muted-foreground">
          {fallback}
        </span>
      ) : (
        <div className="w-4 h-4 rounded-full bg-muted/50" />
      )}
      
      {/* 选中时的脉冲效果 */}
      {selected && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-primary animate-ping"
          style={{ animationDuration: '2s', opacity: 0.3 }}
        />
      )}
    </div>
  )
}

export const NodeAvatar = memo(NodeAvatarComponent)
NodeAvatar.displayName = 'NodeAvatar'

