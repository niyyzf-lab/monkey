import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Circle } from 'lucide-react'
import { useMemo } from 'react'
import {
  FeelPageHeader,
  MarketPulseCard,
  MarketSentimentCard,
  FundFlowCard,
  LimitStatsCard,
  HotSectorsCard,
} from '@/components/feel'
import { MOCK_MARKET_DATA, ANIMATION_DELAYS } from '@/constants/market-config'

export const Route = createFileRoute('/feel/')({
  component: FeelPage,
})

/**
 * 观猴感页面 - 市场概览
 * 展示市场指数、情绪、资金流向和热门板块
 */
function FeelPage() {
  // 使用 useMemo 缓存时间计算，避免不必要的重渲染
  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('zh-CN')
  }, [])

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 xl:p-8 space-y-6 lg:space-y-8">
        {/* 页面标题 */}
        <FeelPageHeader />

        {/* 杂志式布局 */}
        <div className="space-y-4 lg:space-y-6">
          {/* 第一行：主卡片（市场脉搏）+ 次要卡片组 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
            {/* 主卡片 - 市场脉搏 (60%) */}
            <MarketPulseCard 
              mainIndex={MOCK_MARKET_DATA.mainIndex}
              subIndices={MOCK_MARKET_DATA.subIndices}
            />

            {/* 次要卡片组 (40%) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
              {/* 市场温度 */}
              <MarketSentimentCard sentiment={MOCK_MARKET_DATA.sentiment} />

              {/* 资金罗盘 */}
              <FundFlowCard fundFlow={MOCK_MARKET_DATA.fundFlow} />
            </div>
          </div>

          {/* 第二行：涨跌停数据 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <LimitStatsCard stats={MOCK_MARKET_DATA.limitStats} />
          </div>

          {/* 第三行：热门板块 */}
          <HotSectorsCard sectors={MOCK_MARKET_DATA.hotSectors} />
        </div>

        {/* 极简页脚 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: ANIMATION_DELAYS.FOOTER }}
          className="text-center text-xs text-muted-foreground/50 pt-6 lg:pt-8 pb-4 border-t border-border"
        >
          <div className="flex items-center justify-center gap-2">
            <Circle className="w-1 h-1 fill-current" />
            <span>实时更新于 {currentTime}</span>
            <Circle className="w-1 h-1 fill-current" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
