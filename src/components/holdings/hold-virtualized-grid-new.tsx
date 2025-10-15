import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StockHolding } from '../../types/holdings';
import { HoldingCard } from './hold-holding-card';
import FaultyTerminal from '../FaultyTerminal';
import { Plus, BarChart3, ChevronDown, ArrowUp } from 'lucide-react';
import { Button } from '../ui/button';

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
        <div className="h-[260px] rounded-lg bg-muted/20 animate-pulse relative">
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

// 猴子和香蕉主题的连贯文案库
const MONKEY_BANANA_STORIES = {
  titles: [
    "俺是个爱吃香蕉的猴子",
    "俺这只香蕉猴子",
    "猴子俺最爱香蕉了",
    "俺是香蕉收集猴",
    "俺这个香蕉迷猴子",
    "猴子俺对香蕉情有独钟",
    "俺就是个香蕉控猴子",
    "俺这只猴子专门收香蕉"
  ],
  stories: [
    {
      title: "俺是个爱吃香蕉的猴子",
      content: "俺每天都在树上寻找最甜的香蕉🍌 有时候找到黄澄澄的香蕉，俺就开心得不得了！有时候只找到青青的香蕉，俺也不着急，俺知道等等就会变甜的。俺这个憨猴子啊，就是对香蕉有种特别的执着，别的猴子都说俺傻，但俺觉得香蕉就是世界上最好的东西！"
    },
    {
      title: "猴子俺的香蕉园梦想",
      content: "俺一直梦想着有一片属于俺自己的香蕉园🍌 里面种满了各种各样的香蕉树，有大的有小的，有甜的有酸的。俺每天就在香蕉园里荡来荡去，饿了就摘个香蕉吃，渴了就喝点香蕉汁。虽然现在俺还在努力攒香蕉，但俺相信总有一天俺的梦想会实现的！"
    },
    {
      title: "俺这只收集香蕉的猴子",
      content: "俺有个特别的爱好，就是收集各种各样的香蕉🍌 俺的树洞里藏着好多香蕉，有新鲜的，也有晒干的。别的猴子都笑俺说'吃不完为啥还要收集这么多'，但俺就是喜欢看着满满一树洞的香蕉，那种满足感是别人理解不了的。俺觉得香蕉不仅仅是食物，更是俺的宝贝！"
    },
    {
      title: "猴子俺的香蕉哲学",
      content: "俺这个憨猴子啊，对香蕉有种特别的感悟🍌 香蕉从青到黄，需要时间；从硬到软，需要等待。俺觉得这就像俺的人生一样，不能着急，不能强求。俺虽然笨，但俺懂得耐心。就像等香蕉变甜一样，俺也在等着俺的好运气到来！"
    },
    {
      title: "俺和香蕉的不解之缘",
      content: "从小俺就和香蕉特别有缘分🍌 俺第一次尝到香蕉的时候，那种甜蜜的感觉就深深印在俺心里了。俺的妈妈说，俺刚出生的时候，第一个学会的动作就是剥香蕉皮。现在俺长大了，还是最爱香蕉，俺觉得香蕉就是俺生命中最重要的一部分！"
    },
    {
      title: "猴子俺的香蕉交易经",
      content: "俺这个憨猴子啊，最近学会了用香蕉做交易🍌 俺用好香蕉换更多香蕉，虽然有时候会亏，但俺不着急。俺发现香蕉的价值总是会回来的，就像俺小时候妈妈说的'好香蕉永远不会贬值'。俺虽然不懂什么复杂的道理，但俺就是相信香蕉！"
    },
    {
      title: "俺这只香蕉守护猴",
      content: "俺觉得俺的使命就是守护好俺的香蕉🍌 不管市场怎么变，不管别人怎么说，俺都要保护好俺的香蕉宝贝们。有时候香蕉价格跌了，俺也不慌，因为俺知道好香蕉总是会被人认可的。俺这个傻猴子啊，就是这么执着！"
    },
    {
      title: "猴子俺的香蕉信仰",
      content: "俺对香蕉有种近乎信仰的热爱🍌 俺相信每一根香蕉都有它的价值，每一次收获都有它的意义。俺虽然是只简单的猴子，但俺对香蕉的感情是真诚的。俺愿意用俺的一生来追求和守护俺心爱的香蕉，这就是俺这只猴子最大的快乐！"
    }
  ],
  buttons: [
    { primary: "俺要更多香蕉", secondary: "俺研究香蕉" },
    { primary: "俺加购香蕉", secondary: "俺看香蕉" },
    { primary: "俺收集香蕉", secondary: "俺品香蕉" },
    { primary: "俺投资香蕉", secondary: "俺学香蕉" },
    { primary: "俺储存香蕉", secondary: "俺观察香蕉" }
  ],
  statusBar: {
    live: ["香蕉市场开了", "可以交易香蕉了", "香蕉时间到", "香蕉买卖中"],
    offline: ["香蕉市场关了", "香蕉休市了", "等明天买香蕉", "香蕉睡觉时间"]
  }
};

export function VirtualizedGridNew({ holdings, onUpdate }: VirtualizedGridProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  // 随机选择猴子香蕉故事
  const randomStory = useMemo(() => {
    const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    const selectedStory = getRandomItem(MONKEY_BANANA_STORIES.stories);
    
    return {
      story: selectedStory,
      buttons: getRandomItem(MONKEY_BANANA_STORIES.buttons),
      statusLive: getRandomItem(MONKEY_BANANA_STORIES.statusBar.live),
      statusOffline: getRandomItem(MONKEY_BANANA_STORIES.statusBar.offline)
    };
  }, []);

  // 监听底部区域可见性,延迟渲染动态背景
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsBottomVisible(true);
          }
        });
      },
      {
        rootMargin: '200px', // 提前200px开始加载
        threshold: 0.01,
      }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // 监听滚动,实现自动滚动到底部和显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      if (!bottomRef.current || !containerRef.current) return;

      const scrollContainer = document.querySelector('.h-full.overflow-y-auto') as HTMLElement;
      if (!scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      
      // 只有在底部区域才显示回到顶部按钮
      const bottomRect = bottomRef.current.getBoundingClientRect();
      const isInBottomArea = bottomRect.top < clientHeight && bottomRect.bottom > 0;
      setShowBackToTop(isInBottomArea);

      // 自动滚动到底部:当滚动到距离底部一定距离时
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const autoScrollThreshold = clientHeight * 0.5; // 距离底部半屏时触发

      if (distanceFromBottom < autoScrollThreshold && !hasAutoScrolled) {
        setHasAutoScrolled(true);
        scrollContainer.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }

      // 重置自动滚动状态(向上滚动时)
      if (distanceFromBottom > autoScrollThreshold * 1.5) {
        setHasAutoScrolled(false);
      }
    };

    const scrollContainer = document.querySelector('.h-full.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [hasAutoScrolled]);

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


  // 判断是否是交易时段 (9:30-15:00 工作日)
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const isMarketOpen = isWeekday && ((hour === 9 && minute >= 30) || (hour > 9 && hour < 15));


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
            className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 flex items-center justify-center text-white group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="h-6 w-6 group-hover:animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 向下滚动提示 - 在卡片列表和底部区域之间 */}
      <motion.div 
        className="flex flex-col items-center gap-3 mt-32 mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="text-xs tracking-[0.3em] text-foreground/40 font-mono">
          继续向下
        </div>
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown className="h-5 w-5 text-foreground/30" />
          <ChevronDown className="h-5 w-5 text-foreground/20 -mt-3" />
        </motion.div>
      </motion.div>
      
      {/* 底部留白区域 - 增加距离 */}
      <motion.div 
        ref={bottomRef}
        className="relative mt-[120vh] overflow-hidden flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        style={{ height: '90vh' }}
      >
        {/* FaultyTerminal 背景 - 懒加载 绿色 */}
        {isBottomVisible && (
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <FaultyTerminal
              scale={1.5}
              gridMul={[2, 1]}
              digitSize={1.2}
              timeScale={1}
              pause={false}
              scanlineIntensity={1}
              glitchAmount={1}
              flickerAmount={1}
              noiseAmp={1}
              chromaticAberration={0}
              dither={0}
              curvature={0}
              tint="#10b981"
              mouseReact={true}
              mouseStrength={0.5}
              pageLoadAnimation={false}
              brightness={1}
            />
          </motion.div>
        )}

        {/* 渐变遮罩 - 绿色科幻感 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background pointer-events-none" />
        
        {/* 顶部光晕效果 - 绿色调 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-radial from-green-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* 内容 - 居中显示,无卡片,直接浮在背景上 */}
        <motion.div 
          className="relative z-10 w-full px-3 sm:px-4 md:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          {/* 居中内容布局 */}
          <div className="max-w-6xl mx-auto h-full flex items-center justify-center">
            
            {/* 主内容容器 - 去除卡片，直接平铺在背景上 */}
            <motion.div 
              className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ 
                delay: 0.2, 
                duration: 1,
                type: "spring",
                stiffness: 80
              }}
            >
              
              {/* 顶部：猴子头像 + 标题 */}
              <div className="text-center mb-6 sm:mb-8">
                
                {/* 猴子头像 */}
                <motion.div 
                  className="relative inline-block mb-3 sm:mb-4"
                  initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                  whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: false }}
                  transition={{ 
                    delay: 0.4, 
                    duration: 1,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* 绿色光环 */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 sm:w-24 md:w-32 lg:w-40 xl:w-48 h-20 sm:h-24 md:h-32 lg:h-40 xl:h-48 rounded-full bg-green-500/20 blur-2xl"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <motion.div 
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl relative z-10"
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, -3, 3, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🐵
                  </motion.div>
                </motion.div>
                
                {/* 故事标题 */}
                <motion.h2 
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-foreground mb-4 sm:mb-6 tracking-tight drop-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                >
                  {randomStory.story.title}
                </motion.h2>
              </div>


              {/* 猴子香蕉故事内容 */}
              <motion.div 
                className="text-center max-w-5xl mx-auto mb-6 sm:mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <div className="bg-green-500/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-green-500/10 backdrop-blur-sm">
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed sm:leading-loose text-foreground/90 drop-shadow-md font-light tracking-wide">
                    {randomStory.story.content}
                  </p>
                </div>
              </motion.div>

              {/* 底部：按钮组 */}
              <div className="space-y-6">
                
                {/* 按钮组 */}
                <motion.div 
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      className="h-9 sm:h-10 md:h-11 px-4 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base font-bold tracking-wider bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30 w-full sm:w-auto"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {randomStory.buttons.primary}
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="h-9 sm:h-10 md:h-11 px-4 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base font-bold tracking-wider border-2 border-green-500/50 hover:bg-green-500/10 hover:border-green-500/70 shadow-lg text-green-600 w-full sm:w-auto"
                    >
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {randomStory.buttons.secondary}
                    </Button>
                  </motion.div>
                </motion.div>

                {/* 底部状态栏 */}
                <motion.div 
                  className="pt-3 sm:pt-4 border-t border-green-500/20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs">
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                      <motion.span 
                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isMarketOpen ? 'bg-green-500' : 'bg-foreground/30'}`}
                        animate={isMarketOpen ? { 
                          scale: [1, 1.4, 1],
                          opacity: [1, 0.5, 1]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="tracking-wide text-foreground/80 text-[10px] sm:text-xs md:text-sm drop-shadow-md">
                        {isMarketOpen ? randomStory.statusLive : randomStory.statusOffline}
                      </span>
                    </div>
                    
                    <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-background/30 border border-green-500/10 font-mono tracking-wider text-foreground/70 text-[10px] sm:text-xs md:text-sm drop-shadow-md">
                      {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              </div>
              
            </motion.div>

          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
