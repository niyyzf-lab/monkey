import { useState, useEffect } from 'react';
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
import { AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface UnlockConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const AGREEMENT_TEXT = `高级系统设置修改协议

警告：修改系统级配置参数可能会影响应用的正常运行。

在继续之前，请仔细阅读以下内容：

1. 系统设置包括交易规则和费用设置等核心配置
2. 不正确的设置可能导致计算错误或功能异常
3. 修改前请确保您了解每个参数的含义和影响
4. 建议在修改前备份当前配置
5. 如果您不确定某项设置的作用，请勿随意修改

确认修改风险：
- 我已充分理解修改系统设置的风险
- 我已阅读并理解上述警告内容
- 我愿意承担因错误配置导致的一切后果
- 我已确认自己具备足够的技术知识进行此操作

请输入确认语句以继续：`;

const CONFIRM_TEXT = '我是不是猴子,我不吃香蕉';

export function UnlockConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: UnlockConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [agreementRef, setAgreementRef] = useState<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (agreementRef) {
      const { scrollTop, scrollHeight, clientHeight } = agreementRef;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolled(true);
      }
    }
  };

  const handleConfirm = () => {
    if (inputValue.trim() === CONFIRM_TEXT) {
      onConfirm();
      onOpenChange(false);
    }
  };

  // 重置状态当对话框关闭时
  useEffect(() => {
    if (!open) {
      setInputValue('');
      setHasScrolled(false);
    }
  }, [open]);

  const isValid = hasScrolled && inputValue.trim() === CONFIRM_TEXT;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            <DialogTitle>解锁高级系统设置</DialogTitle>
          </div>
          <DialogDescription>
            为保护系统安全，请先阅读协议并完成验证
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900 dark:text-amber-100">
                <strong>重要提示：</strong> 系统设置涉及核心功能，修改前请务必仔细阅读协议内容。
              </div>
            </div>
          </div>

          <div
            ref={setAgreementRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto border border-border rounded-lg p-4 bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap"
          >
            {AGREEMENT_TEXT}
          </div>

          {hasScrolled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <label className="text-sm font-medium text-foreground mb-2 block">
                请输入确认语句：
                <span className="text-muted-foreground font-normal ml-2">
                  "{CONFIRM_TEXT}"
                </span>
              </label>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="请输入确认语句"
                className="font-mono text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValid) {
                    handleConfirm();
                  }
                }}
              />
            </motion.div>
          )}

          {!hasScrolled && (
            <div className="mt-4 text-xs text-muted-foreground text-center py-2">
              请滚动到底部阅读完整协议
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            确认解锁
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

