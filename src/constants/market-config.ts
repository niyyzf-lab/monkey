/**
 * 市场页面配置常量
 */

// 动画延迟时间（秒）
export const ANIMATION_DELAYS = {
  HEADER: 0,
  MAIN_CARD: 0.1,
  SENTIMENT_CARD: 0.2,
  FUND_CARD: 0.25,
  LIMIT_UP: 0.3,
  LIMIT_DOWN: 0.35,
  STRONG_STOCKS: 0.4,
  HOT_SECTORS: 0.45,
  FOOTER: 0.7,
} as const

// 动画持续时间（秒）
export const ANIMATION_DURATIONS = {
  FADE_IN: 0.5,
  HOVER: 0.3,
  PULSE: 2,
  COMPASS_ROTATE: 20,
} as const

// 卡片悬停效果
export const HOVER_EFFECTS = {
  Y_OFFSET: -4,
  SCALE: 1.05,
} as const

// 模拟市场数据
export const MOCK_MARKET_DATA = {
  mainIndex: {
    name: 'Shanghai Shenzhen 300',
    value: '3,845.23',
    change: '+2.34%',
    isUp: true,
  },
  subIndices: [
    { name: '创业板指', value: '2,156.34', change: '+1.82%', isUp: true },
    { name: '科创50', value: '1,023.67', change: '-0.56%', isUp: false },
  ],
  sentiment: {
    temperature: 87,
    status: '活跃交易中',
  },
  fundFlow: {
    amount: '+15.2亿',
    direction: 'inflow' as const,
  },
  limitStats: {
    limitUp: 186,
    limitDown: 45,
    strongStocks: 523,
    limitUpChange: 23,
    limitDownChange: -12,
  },
  hotSectors: [
    { name: '半导体', change: '+5.23%', volume: '385亿', rank: 1 },
    { name: '新能源', change: '+4.12%', volume: '298亿', rank: 2 },
    { name: '人工智能', change: '+3.89%', volume: '267亿', rank: 3 },
  ],
} as const

