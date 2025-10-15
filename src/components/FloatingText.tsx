import React, { useMemo, useRef } from 'react';
import { motion, AnimatePresence, Transition } from 'motion/react';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface FloatingTextProps {
  text: string;
  className?: string;
  staggerDuration?: number;
  transition?: Transition;
  animationKey?: string | number; // 用于强制触发动画的 key
  delay?: number; // 整体动画延迟（秒）
  disableInitialAnimation?: boolean; // 是否禁用初始动画
}

const FloatingText: React.FC<FloatingTextProps> = ({
  text,
  className,
  staggerDuration = 0.04,
  transition = { type: 'spring', damping: 28, stiffness: 280 },
  delay = 0,
  disableInitialAnimation = true // 默认禁用初始动画
}) => {
  // 追踪是否为首次挂载
  const isFirstMount = useRef(true);
  
  // 追踪前一次的文本值
  const prevTextRef = useRef(text);
  
  // 分割字符串为字符数组，兼容 emoji 和复合字符
  const splitIntoCharacters = (text: string): string[] => {
    // 首先尝试使用 Intl.Segmenter (现代浏览器支持)
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      try {
        const segmenter = new (Intl as any).Segmenter('en', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(text), (segment: any) => segment.segment);
      } catch (e) {
        // 降级到 Array.from
      }
    }
    
    // 降级方案：使用 Array.from 或正则表达式分割
    // Array.from 能正确处理大多数 emoji 和 Unicode 字符
    return Array.from(text);
  };

  const characters = useMemo(() => splitIntoCharacters(text), [text]);

  // 检测是否应该播放动画
  const shouldPlayAnimation = useMemo(() => {
    // 首次挂载
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevTextRef.current = text;
      return !disableInitialAnimation;
    }
    
    // 检测文本变化
    const hasChanged = text !== prevTextRef.current;
    if (hasChanged) {
      prevTextRef.current = text;
      return true;
    }
    
    return false;
  }, [text, disableInitialAnimation]);

  // 生成动画键值，每次文本变化时都生成新的key
  const currentAnimationKey = useMemo(() => {
    return shouldPlayAnimation ? `${text}-${Date.now()}` : `static-${text}`;
  }, [text, shouldPlayAnimation]);

  return (
    <span className={cn('inline-flex overflow-hidden', className)}>
      <span className="sr-only">{text}</span>
      {shouldPlayAnimation ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentAnimationKey}
            className="inline-flex overflow-hidden"
            aria-hidden="true"
          >
            {characters.map((char, index) => (
              <motion.span
                key={`${index}-${char}`}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  ...transition,
                  delay: delay + index * staggerDuration
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      ) : (
        // 静态显示，无动画
        <span className="inline-flex" aria-hidden="true">
          {text}
        </span>
      )}
    </span>
  );
};

FloatingText.displayName = 'FloatingText';
export default FloatingText;

