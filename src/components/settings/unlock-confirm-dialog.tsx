import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UnlockConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const AGREEMENT_TEXT = `高级交易设置修改协议

警告：修改交易配置参数可能会影响应用的正常运行。

在继续之前，请仔细阅读以下内容：

1. 交易设置包括交易规则和费用设置等核心配置
2. 不正确的设置可能导致计算错误或功能异常
3. 修改前请确保您了解每个参数的含义和影响
4. 建议在修改前备份当前配置
5. 如果您不确定某项设置的作用，请勿随意修改

确认修改风险：
- 我已充分理解修改交易设置的风险
- 我已阅读并理解上述警告内容
- 我愿意承担因错误配置导致的一切后果
- 我已确认自己具备足够的技术知识进行此操作

请输入确认语句以继续：`;

const CONFIRM_TEXT = '我不是猴子我不吃香蕉';

// 规范化字符串：去除首尾空白，并去除所有内部空白字符进行比较
const normalizeText = (text: string) => {
  return text.trim().replace(/\s+/g, '');
};

export function UnlockConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: UnlockConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [agreementRef, setAgreementRef] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScroll = () => {
    if (agreementRef) {
      const { scrollTop, scrollHeight, clientHeight } = agreementRef;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolled(true);
        // 滚动到底部后，延迟聚焦输入框
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      }
    }
  };

  const handleConfirm = () => {
    if (normalizeText(inputValue) === normalizeText(CONFIRM_TEXT)) {
      onConfirm();
      onOpenChange(false);
    }
  };

  // 检查内容是否需要滚动，如果不需要滚动则自动设置为已滚动
  useEffect(() => {
    if (open && agreementRef) {
      // 延迟检查，确保 DOM 已渲染完成
      const checkScrollable = () => {
        if (agreementRef) {
          const { scrollHeight, clientHeight } = agreementRef;
          // 如果内容高度小于等于容器高度（不需要滚动），自动设置为已滚动
          if (scrollHeight <= clientHeight + 1) {
            setHasScrolled(true);
          }
        }
      };
      
      // 立即检查一次
      checkScrollable();
      
      // 延迟检查，确保内容完全渲染
      const timer = setTimeout(checkScrollable, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, agreementRef]);

  // 重置状态当对话框关闭时
  useEffect(() => {
    if (!open) {
      setInputValue('');
      setHasScrolled(false);
    }
  }, [open]);

  const normalizedInput = normalizeText(inputValue);
  const normalizedConfirm = normalizeText(CONFIRM_TEXT);
  
  const isValid = hasScrolled && normalizedInput === normalizedConfirm;
  const isCorrect = normalizedInput === normalizedConfirm;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">解锁高级交易设置</DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                为保护系统安全，请先阅读协议并完成验证
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg backdrop-blur-sm">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                  <strong className="font-semibold">重要提示：</strong> 交易设置涉及核心功能，修改前请务必仔细阅读协议内容。错误配置可能导致应用功能异常。
                </div>
              </div>
            </div>
          </motion.div>

          <div
            ref={setAgreementRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto border border-border/50 rounded-lg p-5 bg-gradient-to-br from-muted/40 to-muted/20 text-sm leading-relaxed whitespace-pre-wrap font-mono text-foreground/90 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            style={{
              scrollbarWidth: 'thin',
            }}
          >
            {AGREEMENT_TEXT}
            {hasScrolled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-green-600 dark:text-green-400 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>已阅读完整协议</span>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {hasScrolled && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      请输入确认语句
                    </label>
                    {isCorrect && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>验证通过</span>
                      </motion.div>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="在此输入确认语句..."
                      className={`w-full h-11 text-sm font-mono border-2 transition-all ${
                        isCorrect
                          ? 'border-green-500 dark:border-green-400 bg-green-50/50 dark:bg-green-950/20 focus:border-green-600 dark:focus:border-green-300'
                          : 'border-border focus:border-amber-500 dark:focus:border-amber-400'
                      } focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && isValid) {
                          handleConfirm();
                        }
                      }}
                    />
                    {inputValue && !isCorrect && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                      >
                        不匹配
                      </motion.div>
                    )}
                  </div>
                  {inputValue && !isCorrect && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground"
                    >
                      请输入正确的确认语句
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!hasScrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                <span>请滚动到底部阅读完整协议</span>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`gap-2 transition-all ${
              isValid
                ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600'
                : ''
            }`}
          >
            <Lock className="h-4 w-4" />
            确认解锁
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

