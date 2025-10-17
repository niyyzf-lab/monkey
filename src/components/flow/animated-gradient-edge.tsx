import { memo } from 'react'
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import { cn } from '@/lib/utils'

/**
 * 炫酷数据流动画边组件
 * 多层发光 + 流动粒子 + 脉冲波纹 + 数据流线
 * 生动体现数据在模块间流动的感觉
 */
function AnimatedGradientEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  // 强制下移连接线以对齐手柄中心
  const adjustedSourceY = sourceY + 2.5
  const adjustedTargetY = targetY + 2.5
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY: adjustedSourceY,
    sourcePosition,
    targetX,
    targetY: adjustedTargetY,
    targetPosition,
    borderRadius: 16,
  })

  // 为路径生成唯一 ID，供渐变和动画使用
  const pathId = `path-${id}`
  const gradientId = `gradient-${id}`
  const glowGradientId = `glow-gradient-${id}`
  
  // 获取标签文本
  const label = data?.label as string | undefined

  return (
    <>
      {/* 定义渐变和滤镜 */}
      <defs>
        {/* 静态基础渐变 - 确保可见 */}
        <linearGradient id={`${gradientId}-base`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.6" />
          <stop offset="50%" stopColor="hsl(var(--foreground))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.6" />
        </linearGradient>
        
        {/* 主渐变 - 流动的色彩 */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
          <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
        </linearGradient>
        
        {/* 发光渐变 */}
        <linearGradient id={glowGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
          <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
        </linearGradient>
        
        {/* 流动动画渐变 */}
        <linearGradient id={`${gradientId}-flow`}>
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0">
            <animate attributeName="offset" values="-0.5;1.5" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="0.3" stopColor="hsl(var(--accent))" stopOpacity="0.9">
            <animate attributeName="offset" values="-0.2;1.8" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="0.5" stopColor="hsl(var(--primary))" stopOpacity="1">
            <animate attributeName="offset" values="0;2" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="0.7" stopColor="hsl(var(--accent))" stopOpacity="0.9">
            <animate attributeName="offset" values="0.2;2.2" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="1%" stopColor="hsl(var(--primary))" stopOpacity="0">
            <animate attributeName="offset" values="0.5;2.5" dur="2s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>

      {/* 基础静态路径 - 确保始终可见 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId}-base)`}
        strokeWidth={selected ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: 0.4,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 最外层发光 - 柔和的光晕 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${glowGradientId})`}
        strokeWidth={selected ? 20 : 14}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: 'blur(10px)',
          opacity: selected ? 0.35 : 0.2,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 中层发光 - 增强对比 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 8 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: 'blur(4px)',
          opacity: 0.6,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 主路径 - 清晰的边缘 */}
      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 3 : 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: 0.9,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
        markerEnd={markerEnd}
      />
      
      {/* 流动效果层 - 数据流动画 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId}-flow)`}
        strokeWidth={selected ? 4 : 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: 0.85,
          ...(style as React.CSSProperties),
        }}
      />

      {/* 数据流粒子 - 更多更密集 */}
      {[0, 0.2, 0.4, 0.6, 0.8].map((offset, index) => (
        <g key={`particle-${index}`}>
          {/* 粒子拖尾光晕 */}
          <circle
            r={selected ? 10 : 7}
            fill={`url(#${glowGradientId})`}
            style={{ 
              filter: 'blur(6px)',
              opacity: 0.4,
            }}
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin={`${offset * 3}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          
          {/* 粒子中层发光 */}
          <circle
            r={selected ? 5 : 4}
            fill="hsl(var(--accent))"
            style={{ opacity: 0.85 }}
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin={`${offset * 3}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
            {/* 脉冲呼吸 */}
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={selected ? "5;6;5" : "4;5;4"}
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* 粒子核心亮点 */}
          <circle
            r={selected ? 2.5 : 2}
            fill="hsl(var(--background))"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin={`${offset * 3}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
        </g>
      ))}

      {/* 边缘标签 - 精致设计 */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="relative">
              {/* 标签发光背景 */}
              {selected && (
                <>
                  <div 
                    className="absolute inset-0 rounded-full blur-lg opacity-40 bg-gradient-to-r from-primary via-accent to-primary animate-pulse"
                    style={{ animationDuration: '2s' }}
                    aria-hidden="true"
                  />
                  <div 
                    className="absolute inset-0 rounded-full blur-md opacity-30 bg-gradient-to-r from-primary via-accent to-primary"
                    aria-hidden="true"
                  />
                </>
              )}
              
              {/* 标签内容 */}
              <div
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[10px] font-semibold tracking-wide",
                  "shadow-lg border backdrop-blur-xl",
                  "transition-all duration-300 hover:scale-105",
                  selected
                    ? "bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 border-primary/50 text-primary shadow-primary/20"
                    : "bg-card/95 border-border/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </div>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const AnimatedGradientEdge = memo(AnimatedGradientEdgeComponent)
AnimatedGradientEdge.displayName = 'AnimatedGradientEdge'
