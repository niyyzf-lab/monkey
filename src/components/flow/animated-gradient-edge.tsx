import { memo } from 'react'
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import type { EdgeStatus } from '@/components/feel/feel-workflow-context'

/**
 * 简化版动画边组件 - 三种状态
 * idle: 灰色虚线
 * animating: 蓝色实线 + 动画
 * completed: 绿色实线
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
  // 获取工作流状态
  const workflowStatus = (data?.workflowStatus as EdgeStatus) || 'idle'
  
  // 计算路径
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
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

  const label = data?.label as string | undefined
  const dataText = data?.dataText as string | undefined

  return (
    <g>
      {/* 定义发光滤镜 */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
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
            const rawText = dataText || label || '数据传递中';
            // 去除所有标点符号
            const cleanText = rawText.replace(/[，。！？、：；""''（）《》【】「」…—·,\.!\?:;'"()\[\]{}<>\/\\|@#$%^&*+=`~\s]/g, '');
            // 按2个字切分，展示所有词组
            const chunks: string[] = [];
            for (let i = 0; i < cleanText.length; i += 2) {
              chunks.push(cleanText.slice(i, i + 2));
            }
            // 保持原始顺序，让"正在"等开头文字作为火车头
            const duration = 6; // 动画时长
            const delay = 0.7; // 每节车厢的间隔时间
            
            return chunks.map((chunk, index) => {
              const isFirst = index === 0; // 火车头（"正在"等开头）
              return (
                <g key={`chunk-${index}`}>
                  {/* 车厢阴影 - 增加立体感 */}
                  <rect
                    x="-16"
                    y="-7"
                    width="32"
                    height="14"
                    rx="6"
                    ry="6"
                    fill="black"
                    opacity="0.12"
                  >
                    <animateMotion
                      dur={`${duration}s`}
                      repeatCount="indefinite"
                      path={edgePath}
                      begin={`${index * delay}s`}
                      rotate="auto"
                    />
                  </rect>
                  
                  {/* 车厢背景 - 渐变效果 */}
                  <defs>
                    <linearGradient id={`gradient-${id}-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity="0.88" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="-17"
                    y="-8"
                    width="34"
                    height="16"
                    rx="6"
                    ry="6"
                    fill={`url(#gradient-${id}-${index})`}
                    stroke="white"
                    strokeWidth={isFirst ? "1.5" : "1"}
                    opacity={isFirst ? "1" : "0.95"}
                    filter={isFirst ? "url(#glow)" : "none"}
                  >
                    <animateMotion
                      dur={`${duration}s`}
                      repeatCount="indefinite"
                      path={edgePath}
                      begin={`${index * delay}s`}
                      rotate="auto"
                    />
                  </rect>
                  
                  {/* 火车头标识 - 小圆灯 */}
                  {isFirst && (
                    <circle
                      cx="13"
                      cy="0"
                      r="2.5"
                      fill="white"
                      opacity="0.9"
                    >
                      <animateMotion
                        dur={`${duration}s`}
                        repeatCount="indefinite"
                        path={edgePath}
                        begin={`${index * delay}s`}
                        rotate="auto"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.9;0.5;0.9"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  
                  {/* 车厢文本 */}
                  <text
                    fontSize="11"
                    fontWeight={isFirst ? "700" : "600"}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      letterSpacing: '0.3px'
                    }}
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
              );
            });
          })()}
        </>
      )}
      
      {/* 标签 - 只有 completed 状态显示 */}
      {workflowStatus === 'completed' && (label || dataText) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-full border border-green-500/50">
              ✓ {dataText || label}
            </div>
          </div>
        </EdgeLabelRenderer>
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

export const AnimatedGradientEdge = memo(AnimatedGradientEdgeComponent)
AnimatedGradientEdge.displayName = 'AnimatedGradientEdge'
