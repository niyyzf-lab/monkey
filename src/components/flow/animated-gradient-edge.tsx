import { memo } from 'react'
import {
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'

/**
 * 优化的动画渐变边组件
 * 更现代、简洁、专业的设计
 * 用于模块之间的主要数据流连接
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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // 为路径生成唯一 ID，供渐变和动画使用
  const pathId = `path-${id}`
  const gradientId = `gradient-${id}`
  
  // 获取标签文本
  const label = data?.label as string | undefined

  return (
    <>
      {/* 定义渐变 */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* 外层发光 */}
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(var(--primary) / 0.2)"
        strokeWidth={selected ? 12 : 10}
        strokeLinecap="round"
        style={{
          filter: 'blur(6px)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 中层发光 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 4 : 3}
        strokeLinecap="round"
        style={{
          filter: 'blur(2px)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 主边缘路径 */}
      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={selected ? 2.5 : 2}
        strokeLinecap="round"
        style={{
          transition: 'all 0.2s ease',
          ...(style as React.CSSProperties),
        }}
        markerEnd={markerEnd}
      />

      {/* 流动光点动画 - 更少更精致 */}
      {[0, 0.5].map((offset, index) => (
        <g key={`particle-${index}`}>
          {/* 光点外发光 */}
          <circle
            r={selected ? 5 : 4}
            fill="hsl(var(--primary) / 0.4)"
            style={{ filter: 'blur(3px)' }}
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin={`${offset * 3}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          {/* 光点核心 */}
          <circle
            r={selected ? 2.5 : 2}
            fill="hsl(var(--primary))"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin={`${offset * 3}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
            {/* 脉冲动画 */}
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}

      {/* 边缘标签 */}
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
            <div
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium shadow-lg border backdrop-blur-md transition-all hover:scale-105"
              style={{
                background: 'hsl(var(--primary) / 0.15)',
                color: 'hsl(var(--primary-foreground))',
                borderColor: 'hsl(var(--primary) / 0.3)',
              }}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const AnimatedGradientEdge = memo(AnimatedGradientEdgeComponent)
AnimatedGradientEdge.displayName = 'AnimatedGradientEdge'
