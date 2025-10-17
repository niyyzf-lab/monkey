import { memo } from 'react'
import {
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'

/**
 * 自定义动画渐变边组件
 * 带流动粒子效果的贝塞尔曲线连接线
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

  // 为路径生成唯一 ID，供粒子动画使用
  const pathId = `path-${id}`
  
  // 获取标签文本
  const label = data?.label as string | undefined

  return (
    <>
      {/* 背景发光层 */}
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(var(--primary) / 0.3)"
        strokeWidth={selected ? 8 : 6}
        style={{
          ...(style as React.CSSProperties),
        }}
      />

      {/* 主边缘路径 */}
      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={selected ? 3 : 2.5}
        style={{
          transition: 'stroke-width 0.2s ease',
          ...(style as React.CSSProperties),
        }}
        markerEnd={markerEnd}
      />

      {/* 流动粒子动画 */}
      {[0, 0.33, 0.66].map((offset, index) => (
        <g key={`particle-${index}`}>
          {/* 粒子发光效果 */}
          <circle
            r={selected ? 6 : 5}
            fill="hsl(var(--primary) / 0.3)"
          >
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin={`${offset * 2.5}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          {/* 粒子核心 */}
          <circle
            r={selected ? 3.5 : 3}
            fill="hsl(var(--primary))"
          >
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin={`${offset * 2.5}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
            {/* 粒子的脉冲动画 */}
            <animate
              attributeName="r"
              values={selected ? "3.5;4.5;3.5" : "3;4;3"}
              dur="1s"
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
              className="rounded-md px-2 py-1 text-xs font-medium shadow-md border transition-all"
              style={{
                background: 'hsl(var(--card) / 0.95)',
                color: 'hsl(var(--card-foreground))',
                borderColor: 'hsl(var(--border))',
                backdropFilter: 'blur(8px)',
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
