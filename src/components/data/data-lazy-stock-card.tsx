import { memo, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { StockDetailCard } from '@/components/data_tags/data-tags-stock-detail-card'
import { StockCompanyInfo } from '@/types/stock_details'
import { StockCardSkeleton } from './data-stock-card-skeleton'

interface LazyStockCardProps {
  index: number
  data: StockCompanyInfo
}

export const LazyStockCard = memo(function LazyStockCard({ index, data }: LazyStockCardProps) {
  // 首屏内容直接显示，避免空白
  const [isVisible, setIsVisible] = useState(index < 10)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 如果已经可见，不需要观察
    if (isVisible) return

    const currentCard = cardRef.current
    if (!currentCard) {
      // 如果ref没有成功绑定，直接显示内容
      setIsVisible(true)
      return
    }

    // 检查IntersectionObserver是否可用
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '300px', // 提前300px开始加载
        threshold: 0
      }
    )

    observer.observe(currentCard)

    return () => {
      observer.disconnect()
    }
  }, [isVisible, index])

  return (
    <div ref={cardRef} className="masonry-item" style={{ minHeight: isVisible ? 'auto' : '200px' }}>
      {isVisible ? (
        <motion.div 
          key={`stock-${data.stock_code}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: Math.min((index % 10) * 0.03, 0.3),
            ease: "easeOut"
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <StockDetailCard stockInfo={data} />
        </motion.div>
      ) : (
        <StockCardSkeleton />
      )}
    </div>
  )
})

