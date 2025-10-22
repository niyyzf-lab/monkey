import { memo } from 'react'
import {
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import { useThemeColors } from '@/hooks/use-theme-colors'

/**
 * 现代化贝塞尔曲线边组件
 * 重新设计的炫酷视觉效果
 * 特点：
 * - 多层次霓虹光晕
 * - 流体能量传输动画
 * - 光子粒子系统
 * - 脉冲波扩散效果
 * - 渐变色彩流动
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
  // 获取主题颜色
  const { primary, secondary, accent } = useThemeColors()
  
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const pathId = `edge-path-${id}`
  const primaryGradientId = `primary-gradient-${id}`
  const accentGradientId = `accent-gradient-${id}`
  const flowGradientId = `flow-gradient-${id}`
  const pulseGradientId = `pulse-gradient-${id}`
  const enhancedGlowId = `enhanced-glow-${id}`
  const neonGlowId = `neon-glow-${id}`

  return (
    <>
      <defs>
        {/* 主渐变 - 霓虹蓝紫 */}
        <linearGradient id={primaryGradientId} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={primary} stopOpacity="0.4">
            <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor={accent} stopOpacity="0.9">
            <animate attributeName="stop-opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor={primary} stopOpacity="0.4">
            <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* 强调渐变 - 彩虹流光 */}
        <linearGradient id={accentGradientId} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
          <stop offset="25%" stopColor={primary} stopOpacity="0.8" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="75%" stopColor={primary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.2" />
        </linearGradient>

        {/* 流动渐变 - 能量波 */}
        <linearGradient id={flowGradientId} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="20%" stopColor={primary} stopOpacity="0.3" />
          <stop offset="50%" stopColor={accent} />
          <stop offset="80%" stopColor={primary} stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        {/* 脉冲渐变 - 心跳效果 */}
        <radialGradient id={pulseGradientId}>
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="70%" stopColor={accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>

        {/* 增强发光滤镜 - 多层模糊 */}
        <filter id={enhancedGlowId} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" />
          <feComponentTransfer in="blur1" result="glow1">
            <feFuncA type="linear" slope="3" />
          </feComponentTransfer>
          <feComponentTransfer in="blur2" result="glow2">
            <feFuncA type="linear" slope="2" />
          </feComponentTransfer>
          <feComponentTransfer in="blur3" result="glow3">
            <feFuncA type="linear" slope="1.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="glow3" />
            <feMergeNode in="glow2" />
            <feMergeNode in="glow1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 霓虹光晕滤镜 */}
        <filter id={neonGlowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="coloredBlur"/>
          <feComponentTransfer in="coloredBlur" result="neon">
            <feFuncA type="linear" slope="2.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="neon"/>
            <feMergeNode in="neon"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* 第一层：超大外发光 - 环境氛围 */}
      <path
        d={edgePath}
        fill="none"
        stroke={primary}
        strokeWidth={selected ? 28 : 20}
        strokeLinecap="round"
        style={{
          filter: 'blur(16px)',
          opacity: selected ? 0.15 : 0.06,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 第二层：中等外发光 - 柔和光晕 */}
      <path
        d={edgePath}
        fill="none"
        stroke={selected ? accent : primary}
        strokeWidth={selected ? 18 : 14}
        strokeLinecap="round"
        style={{
          filter: 'blur(10px)',
          opacity: selected ? 0.25 : 0.12,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 第三层：脉冲光晕 - 选中时动态呼吸 */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke={primary}
          strokeWidth={12}
          strokeLinecap="round"
          style={{
            filter: `url(#${enhancedGlowId})`,
            opacity: 0.6,
            animation: 'neon-pulse 2s ease-in-out infinite',
            ...(style as React.CSSProperties),
          }}
        />
      )}

      {/* 第四层：主路径基础 - 实心轨迹 */}
      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke={selected ? primary : secondary}
        strokeWidth={selected ? 4 : 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: selected ? 0.9 : 0.35,
          transition: 'all 0.3s ease',
          ...(style as React.CSSProperties),
        }}
        markerEnd={markerEnd}
      />

      {/* 第五层：渐变流光 - 彩虹能量流 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${accentGradientId})`}
        strokeWidth={selected ? 6 : 4}
        strokeLinecap="round"
        strokeDasharray="24 12"
        style={{
          animation: 'rainbow-flow 2.5s linear infinite',
          filter: selected ? `url(#${neonGlowId})` : 'none',
          opacity: selected ? 1 : 0.75,
          transition: 'all 0.3s ease',
          ...(style as React.CSSProperties),
        }}
      />

      {/* 第六层：能量波 - 脉冲传输 */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${flowGradientId})`}
        strokeWidth={selected ? 8 : 5}
        strokeLinecap="round"
        strokeDasharray="30 150"
        style={{
          animation: 'energy-wave 2s ease-out infinite',
          filter: `drop-shadow(0 0 8px ${accent})`,
          opacity: selected ? 1 : 0.7,
          ...(style as React.CSSProperties),
        }}
      />

      {/* 第七层：光子粒子 - 快速移动 */}
      <path
        d={edgePath}
        fill="none"
        stroke={accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="4 28"
        style={{
          animation: 'photon-flow 1s linear infinite',
          filter: `drop-shadow(0 0 6px ${accent})`,
          opacity: selected ? 1 : 0.7,
          ...(style as React.CSSProperties),
        }}
      />

      {/* 第八层：亮点闪烁 - 数据包 */}
      <path
        d={edgePath}
        fill="none"
        stroke={secondary}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="6 36"
        style={{
          animation: 'data-spark 1.8s linear infinite',
          filter: `drop-shadow(0 0 10px ${primary}) drop-shadow(0 0 4px ${accent})`,
          opacity: selected ? 1 : 0.6,
          ...(style as React.CSSProperties),
        }}
      />

      {/* 选中时的额外效果 */}
      {selected && (
        <>
          {/* 慢速反向流 - 双向通信感 */}
          <path
            d={edgePath}
            fill="none"
            stroke={primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="8 20"
            style={{
              opacity: 0.5,
              animation: 'reverse-stream 3.5s linear infinite reverse',
              filter: `drop-shadow(0 0 4px ${primary})`,
              ...(style as React.CSSProperties),
            }}
          />

          {/* 爆发粒子 - 随机闪现 */}
          <path
            d={edgePath}
            fill="none"
            stroke={accent}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="2 50"
            style={{
              opacity: 0.8,
              animation: 'burst-particles 2.2s linear infinite',
              filter: `drop-shadow(0 0 8px ${accent})`,
              ...(style as React.CSSProperties),
            }}
          />

          {/* 核心亮线 - 最亮部分 */}
          <path
            d={edgePath}
            fill="none"
            stroke={`url(#${primaryGradientId})`}
            strokeWidth={1.5}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${primary}) drop-shadow(0 0 12px ${accent})`,
              ...(style as React.CSSProperties),
            }}
          />
        </>
      )}

      {/* 动画样式定义 */}
      <style>
        {`
          @keyframes rainbow-flow {
            to {
              stroke-dashoffset: -36;
            }
          }

          @keyframes energy-wave {
            0% {
              stroke-dashoffset: 0;
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            85% {
              opacity: 0.5;
            }
            100% {
              stroke-dashoffset: -180;
              opacity: 0;
            }
          }

          @keyframes photon-flow {
            to {
              stroke-dashoffset: -32;
            }
          }

          @keyframes data-spark {
            to {
              stroke-dashoffset: -42;
            }
          }

          @keyframes reverse-stream {
            to {
              stroke-dashoffset: -28;
            }
          }

          @keyframes burst-particles {
            to {
              stroke-dashoffset: -52;
            }
          }

          @keyframes neon-pulse {
            0%, 100% {
              opacity: 0.5;
              stroke-width: 12;
            }
            50% {
              opacity: 0.9;
              stroke-width: 14;
            }
          }
        `}
      </style>
    </>
  )
}

export const BezierEdge = memo(BezierEdgeComponent)
BezierEdge.displayName = 'BezierEdge'
