import { memo } from 'react'
import {
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'

/**
 * 优化的贝塞尔曲线边组件
 * 用于功能节点到模块节点的连接
 * 更专业的虚线动画效果
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
      {/* 外发光层 */}
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(var(--accent) / 0.15)"
        strokeWidth={selected ? 8 : 6}
        strokeLinecap="round"
        style={{
          filter: 'blur(4px)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 内发光层 */}
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(var(--accent) / 0.3)"
        strokeWidth={selected ? 4 : 3}
        strokeLinecap="round"
        style={{
          ...(style as React.CSSProperties),
        }}
      />

      {/* 主边缘路径 */}
      <path
        id={`edge-${id}`}
        d={edgePath}
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth={selected ? 2 : 1.5}
        strokeDasharray="4,4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'all 0.2s ease',
          animation: selected ? 'dash 1s linear infinite' : 'none',
          ...(style as React.CSSProperties),
        }}
        markerEnd={markerEnd}
      />
      
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

