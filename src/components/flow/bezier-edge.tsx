import { memo } from 'react'
import {
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import type { EdgeStatus } from '@/components/feel/feel-workflow-context'

/**
 * 简化版贝塞尔曲线边组件 - 三种状态
 * idle: 灰色虚线
 * animating: 蓝色实线 + 动画
 * completed: 绿色实线
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
  data,
}: EdgeProps) {
  // 获取工作流状态
  const workflowStatus = (data?.workflowStatus as EdgeStatus) || 'idle'
  
  console.log(`🔗 Bezier边 ${id} 渲染:`, {
    id,
    workflowStatus,
    sourceX,
    sourceY,
    targetX,
    targetY,
  })
  
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // 根据状态确定颜色和样式
  let strokeColor = '#94a3b8' // idle: 灰色
  let strokeWidth = 2
  let opacity = 0.5
  let strokeDasharray = '5 5' // 虚线
  
  if (workflowStatus === 'animating') {
    strokeColor = '#3b82f6' // 蓝色
    strokeWidth = 3
    opacity = 1
    strokeDasharray = 'none'
  } else if (workflowStatus === 'completed') {
    strokeColor = '#22c55e' // 绿色
    strokeWidth = 3
    opacity = 1
    strokeDasharray = 'none'
  }

  return (
    <g>
      {/* 主路径 */}
      <path
        id={`path-${id}`}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        style={{
          opacity,
          transition: 'all 0.3s ease',
          ...(style as React.CSSProperties),
        }}
        markerEnd={markerEnd}
      />
      
      {/* 发光层 - 只有 animating 和 completed 状态显示 */}
      {workflowStatus !== 'idle' && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 8}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(8px)',
            opacity: 0.3,
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* 动画效果 - 只有 animating 状态显示 */}
      {workflowStatus === 'animating' && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10 10"
            style={{
              opacity: 0.6,
              animation: 'dash 1s linear infinite',
            }}
          />
          
          {/* 数据传递文本动画 - 像小火车一样排队移动 */}
          {(() => {
            const rawText = (data?.dataText as string) || (data?.label as string) || '数据传递中';
            // 去除所有标点符号
            const cleanText = rawText.replace(/[，。！？、：；""''（）《》【】「」…—·,\.!\?:;'"()\[\]{}<>\/\\|@#$%^&*+=`~\s]/g, '');
            // 按2个字切分，展示所有词组
            const chunks: string[] = [];
            for (let i = 0; i < cleanText.length; i += 2) {
              chunks.push(cleanText.slice(i, i + 2));
            }
            // 反转顺序
            const reversedChunks = chunks.reverse();
            const duration = 5; // 统一动画时长（增加以适应更长的队列）
            const delay = 0.15; // 每个词组的间隔时间（小间隔让小火车更紧凑）
            
            return reversedChunks.map((chunk, index) => (
              <g key={`chunk-${index}`}>
                {/* 词组背景 - 圆角矩形 */}
                <rect
                  x="-20"
                  y="-10"
                  width="40"
                  height="20"
                  rx="6"
                  ry="6"
                  fill={strokeColor}
                  opacity="0.9"
                >
                  <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    path={edgePath}
                    begin={`${index * delay}s`}
                    rotate="auto"
                  />
                </rect>
                
                {/* 词组文本 */}
                <text
                  fontSize="12"
                  fontWeight="600"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {chunk}
                  <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    path={edgePath}
                    begin={`${index * delay}s`}
                    rotate="auto"
                  />
                </text>
              </g>
            ));
          })()}
        </>
      )}
      
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </g>
  )
}

export const BezierEdge = memo(BezierEdgeComponent)
BezierEdge.displayName = 'BezierEdge'
