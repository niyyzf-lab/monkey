import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StockHolding } from '../../types/holdings';
import { SoldCard } from './hold-sold-card';
import { ChevronDown, ChevronUp, Archive } from 'lucide-react';
import { Button } from '../ui/button';

interface LazyCardProps {
  holding: StockHolding;
  index: number;
}

// 使用 Intersection Observer 的懒加载卡片
function LazyCard({ holding, index }: LazyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div 
      ref={cardRef} 
      className="min-h-[200px]"
      layout="position"
      layoutId={`sold-${holding.stockCode}`}
      initial={false}
      transition={{
        layout: {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
    >
      {isVisible ? (
        <SoldCard holding={holding} />
      ) : (
        // 占位符
        <div className="h-[200px] rounded-xl bg-muted/10 border border-dashed border-border/10 dark:border-border/5 animate-pulse relative">
          <div className="absolute top-3 left-4 flex items-center justify-center min-w-[16px] h-4 px-1 rounded text-[10px] bg-muted/20 text-muted-foreground/30 font-bold tabular-nums leading-none">
            {index + 1}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface SoldGridProps {
  holdings: StockHolding[];
}

export function SoldGrid({ holdings }: SoldGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 默认只显示前6个
  const displayedHoldings = isExpanded ? holdings : holdings.slice(0, 6);
  const hasMore = holdings.length > 6;

  if (holdings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <motion.div 
        className="flex items-center justify-between px-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 border border-border/20">
            <Archive className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground/80">历史持仓</h3>
            <p className="text-[10px] text-muted-foreground/60">已清仓股票 · 共 {holdings.length} 只</p>
          </div>
        </div>
        
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-3 text-xs gap-1.5"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                展开全部 ({holdings.length})
              </>
            )}
          </Button>
        )}
      </motion.div>

      {/* 卡片网格 */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          className="grid gap-3 grid-cols-1 @[560px]:grid-cols-2 @[840px]:grid-cols-3 @[1120px]:grid-cols-4 @[1400px]:grid-cols-5 @[1680px]:grid-cols-6"
          layout
        >
          {displayedHoldings.map((holding, index) => (
            <LazyCard 
              key={holding.stockCode} 
              holding={holding}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* 底部展开按钮（移动端友好） */}
      {hasMore && !isExpanded && (
        <motion.div 
          className="flex justify-center pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="h-9 px-4 text-xs gap-2 border-dashed"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            查看更多历史持仓 ({holdings.length - 6} 只)
          </Button>
        </motion.div>
      )}
    </div>
  );
}


