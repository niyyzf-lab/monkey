/**
 * 市场数据类型定义
 */

export interface MarketIndex {
  name: string
  value: string
  change: string
  isUp: boolean
}

export interface HotSector {
  name: string
  change: string
  volume: string
  rank: number
}

export interface MarketSentiment {
  temperature: number
  status: string
}

export interface FundFlow {
  amount: string
  direction: 'inflow' | 'outflow'
}

export interface LimitStats {
  limitUp: number
  limitDown: number
  strongStocks: number
  limitUpChange: number
  limitDownChange: number
}

