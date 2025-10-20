import { memo } from 'react'
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import { cn } from '@/lib/utils'
import { useThemeColors } from '@/hooks/use-theme-colors'

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
  // 获取主题颜色
  const { primary, secondary, accent } = useThemeColors()
  
  // 向右偏移2像素
  const offsetX = 2;
  // 强制下移连接线以对齐手柄中心
  const adjustedSourceY = sourceY + 2.5
  const adjustedTargetY = targetY + 2.5

  const [edgePath, rawLabelX, rawLabelY] = getSmoothStepPath({
    sourceX: sourceX + offsetX,
    sourceY: adjustedSourceY,
    sourcePosition,
    targetX: targetX + offsetX,
    targetY: adjustedTargetY,
    targetPosition,
    borderRadius: 20,
  })

  // 对labelX也加偏移
  const labelX = rawLabelX + offsetX
  const labelY = rawLabelY

  // 为路径生成唯一 ID，供渐变和动画使用
  const pathId = `path-${id}`
  const gradientId = `gradient-${id}`
  const glowGradientId = `glow-gradient-${id}`
  const shimmerGradientId = `shimmer-gradient-${id}`
  
  // 获取标签文本
  const label = data?.label as string | undefined

  return (
    <g>
      {/* 定义渐变和滤镜 */}
      <defs>
        {/* 静态基础渐变 */}
        <linearGradient id={`${gradientId}-base`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={secondary} stopOpacity="0.3" />
          <stop offset="50%" stopColor={primary} stopOpacity="0.5" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.3" />
        </linearGradient>
        
        {/* 主渐变 */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={secondary} stopOpacity="0.7" />
          <stop offset="50%" stopColor={primary} stopOpacity="0.9" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.7" />
        </linearGradient>
        
        {/* 发光渐变 */}
        <linearGradient id={glowGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={secondary} stopOpacity="0.4" />
          <stop offset="50%" stopColor={primary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.4" />
        </linearGradient>
        
        {/* 流动动画渐变 - 优雅流动 */}
        <linearGradient id={`${gradientId}-flow`}>
          <stop offset="0%" stopColor={accent} stopOpacity="0">
            <animate attributeName="offset" values="-0.3;1.3" dur="2.5s" repeatCount="indefinite" />
          </stop>
          <stop offset="0.15" stopColor={primary} stopOpacity="0.7">
            <animate attributeName="offset" values="-0.15;1.45" dur="2.5s" repeatCount="indefinite" />
          </stop>
          <stop offset="0.3" stopColor={accent} stopOpacity="0.9">
            <animate attributeName="offset" values="0;1.6" dur="2.5s" repeatCount="indefinite" />
          </stop>
          <stop offset="0.45" stopColor={primary} stopOpacity="0.7">
            <animate attributeName="offset" values="0.15;1.75" dur="2.5s" repeatCount="indefinite" />
          </stop>
          <stop offset="0.6" stopColor={accent} stopOpacity="0">
            <animate attributeName="offset" values="0.3;1.9" dur="2.5s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        
        {/* 闪烁光效渐变 */}
        <linearGradient id={shimmerGradientId}>
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.4">
            <animate attributeName="offset" values="0;1" dur="3.5s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 基础静态路径 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId}-base)`}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: 0.5,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 最外层发光 - 更大范围的光晕 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${glowGradientId})`}
        strokeWidth={selected ? 24 : 16}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: 'blur(12px)',
          opacity: selected ? 0.5 : 0.25,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 中层发光 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 10 : 6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: 'blur(5px)',
          opacity: 0.7,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 主路径 - 清晰锐利 */}
      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 3.5 : 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: 0.95,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
        markerEnd={markerEnd}
      />
      
      {/* 快速流动效果层 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId}-flow)`}
        strokeWidth={selected ? 5 : 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: 0.9,
          ...(style as React.CSSProperties),
        }}
      />
      
      {/* 闪烁光效层 - 增加动感 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${shimmerGradientId})`}
        strokeWidth={selected ? 6 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: 'blur(3px)',
          opacity: 0.6,
          ...(style as React.CSSProperties),
        }}
      />

      {/* 数据流粒子 - 优雅的流动效果 */}
      {[0, 0.33, 0.66].map((offset, index) => (
        <g key={`particle-${index}`}>
          {/* 粒子最外层光晕 */}
          <circle
            r={selected ? 12 : 9}
            fill={`url(#${glowGradientId})`}
            style={{ 
              filter: 'blur(7px)',
              opacity: 0.25,
            }}
          >
            <animateMotion
              dur="3.5s"
              repeatCount="indefinite"
              begin={`${offset * 3.5}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          
          {/* 粒子中层光晕 */}
          <circle
            r={selected ? 6 : 5}
            fill={primary}
            style={{ 
              filter: 'blur(3px)',
              opacity: 0.5 
            }}
          >
            <animateMotion
              dur="3.5s"
              repeatCount="indefinite"
              begin={`${offset * 3.5}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          
          {/* 粒子核心 - 带柔和脉冲 */}
          <circle
            r={selected ? 3 : 2.5}
            fill={accent}
            style={{ opacity: 0.9 }}
          >
            <animateMotion
              dur="3.5s"
              repeatCount="indefinite"
              begin={`${offset * 3.5}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
            {/* 柔和脉冲呼吸 */}
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={selected ? "3;3.5;3" : "2.5;3;2.5"}
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* 粒子亮点核心 */}
          <circle
            r={selected ? 1.2 : 0.8}
            fill={accent}
            style={{ 
              opacity: 1,
              filter: 'brightness(1.3)'
            }}
          >
            <animateMotion
              dur="3.5s"
              repeatCount="indefinite"
              begin={`${offset * 3.5}s`}
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
                    className="absolute inset-0 rounded-full blur-xl opacity-40"
                    style={{ 
                      background: `linear-gradient(135deg, ${primary}, ${accent}, ${primary})`,
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                    aria-hidden="true"
                  />
                  <div 
                    className="absolute inset-0 rounded-full blur-md opacity-30"
                    style={{
                      background: `radial-gradient(circle, ${accent}, transparent 70%)`
                    }}
                    aria-hidden="true"
                  />
                </>
              )}
              
              {/* 标签内容 */}
              <div
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide",
                  "shadow-lg border backdrop-blur-xl",
                  "transition-all duration-300 hover:scale-105",
                  selected
                    ? ""
                    : "bg-card/95 border-border/50 text-muted-foreground hover:text-foreground"
                )}
                style={selected ? {
                  background: `linear-gradient(135deg, ${secondary}40, ${primary}30, ${secondary}40)`,
                  borderColor: primary,
                  color: accent,
                  boxShadow: `0 0 24px ${primary}60, 0 0 8px ${accent}40`
                } : {}}
              >
                {label}
              </div>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  )
}

export const AnimatedGradientEdge = memo(AnimatedGradientEdgeComponent)
AnimatedGradientEdge.displayName = 'AnimatedGradientEdge'
