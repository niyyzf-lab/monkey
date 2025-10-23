import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StockHolding } from '../../types/holdings';
import { HoldingCard } from './hold-holding-card';
import { ArrowUp } from 'lucide-react';

interface LazyCardProps {
  holding: StockHolding;
  onUpdate?: (holding: StockHolding) => void;
  index: number; // 用于计算动画延迟
}

// 使用 Intersection Observer 的懒加载卡片
function LazyCard({ holding, onUpdate, index }: LazyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 进入视窗时显示，离开时隐藏
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        rootMargin: '200px', // 提前 200px 开始加载
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
      className="min-h-[260px]"
      layout="position"
      layoutId={holding.stockCode}
      initial={false}
      transition={{
        layout: {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
    >
      {isVisible ? (
        <HoldingCard 
          holding={holding} 
          onUpdate={onUpdate}
        />
      ) : (
        // 占位符，保持布局稳定，显示序号
        <div className="h-[260px] rounded-xl bg-muted/20 border border-border/20 dark:border-border/10 animate-pulse relative">
          <div className="absolute top-3 left-4 flex items-center justify-center min-w-[16px] h-4 px-1 rounded text-[10px] bg-muted/40 text-muted-foreground/50 font-bold tabular-nums leading-none">
            {index + 1}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface VirtualizedGridProps {
  holdings: StockHolding[];
  onUpdate?: (holding: StockHolding) => void;
}

export function VirtualizedGridNew({ holdings, onUpdate }: VirtualizedGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 监听滚动，显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.h-full.overflow-y-auto') as HTMLElement;
      if (!scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      // 滚动超过一屏时显示回到顶部按钮
      setShowBackToTop(scrollTop > window.innerHeight);
    };

    const scrollContainer = document.querySelector('.h-full.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // 回到顶部
  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.h-full.overflow-y-auto') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };


  return (
    <div ref={containerRef}>
      <AnimatePresence mode="popLayout">
        <div className="grid gap-3 grid-cols-1 @[560px]:grid-cols-2 @[840px]:grid-cols-3 @[1120px]:grid-cols-4 @[1400px]:grid-cols-5 @[1680px]:grid-cols-6">
          {holdings.map((holding, index) => (
            <LazyCard 
              key={holding.stockCode} 
              holding={holding} 
              onUpdate={onUpdate}
              index={index}
            />
          ))}
        </div>
      </AnimatePresence>
      
      {/* 回到顶部按钮 */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-[0_4px_16px_rgba(34,197,94,0.3),0_2px_8px_rgba(34,197,94,0.2),0_0_0_1px_rgba(255,255,255,0.1)_inset] hover:shadow-[0_6px_20px_rgba(34,197,94,0.4),0_3px_10px_rgba(34,197,94,0.25)] flex items-center justify-center text-white group transition-all duration-200 border border-green-400/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="h-6 w-6 group-hover:animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
