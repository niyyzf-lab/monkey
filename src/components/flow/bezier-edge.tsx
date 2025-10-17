import { memo } from 'react'
import {
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'

/**
 * Shadcn 风格的贝塞尔曲线边组件
 * 用于功能节点到模块节点的连接
 * 优化的虚线动画 + 更好的视觉反馈
 */
function BezierEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {/* 外层发光 */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth={4}
          strokeLinecap="round"
          style={{
            filter: 'blur(4px)',
            transition: 'all 0.3s ease',
            ...(style as React.CSSProperties),
          }}
        />
      )}
      
      {/* 主边缘路径 - 优化虚线 */}
      <path
        id={`edge-${id}`}
        d={edgePath}
        fill="none"
        stroke={selected ? "hsl(var(--primary) / 0.8)" : "hsl(var(--muted-foreground) / 0.4)"}
        strokeWidth={selected ? 2 : 1.5}
        strokeDasharray="4,4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'all 0.3s ease',
          animation: selected ? 'dash 2s linear infinite' : 'dash 4s linear infinite',
          ...(style as React.CSSProperties),
        }}
        markerEnd={markerEnd}
      />
      
      {/* 内层亮线（选中时） */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={1}
          strokeDasharray="2,6"
          strokeLinecap="round"
          style={{
            opacity: 0.6,
            animation: 'dash 1s linear infinite reverse',
            ...(style as React.CSSProperties),
          }}
        />
      )}
      
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -8;
            }
          }
        `}
      </style>
    </>
  )
}

export const BezierEdge = memo(BezierEdgeComponent)
BezierEdge.displayName = 'BezierEdge'

