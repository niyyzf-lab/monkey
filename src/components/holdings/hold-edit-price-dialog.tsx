import { useState, useEffect } from 'react';
import { StockHolding } from '../../types/holdings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { validateSellPrice, validateForceClosePrice } from '../../lib/price-validation';
import { AlertCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditPriceDialogProps {
  holding: StockHolding;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (sellPrice: number, forceClosePrice: number) => Promise<void>;
}

export function EditPriceDialog({
  holding,
  open,
  onOpenChange,
  onSave,
}: EditPriceDialogProps) {
  const [sellPrice, setSellPrice] = useState<string>('');
  const [forceClosePrice, setForceClosePrice] = useState<string>('');
  const [sellPriceError, setSellPriceError] = useState<string>('');
  const [forceClosePriceError, setForceClosePriceError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // 初始化表单值
  useEffect(() => {
    if (open) {
      setSellPrice(holding.sellPrice && holding.sellPrice > 0 ? holding.sellPrice.toString() : '');
      setForceClosePrice(
        holding.forceClosePrice && holding.forceClosePrice > 0
          ? holding.forceClosePrice.toString()
          : ''
      );
      setSellPriceError('');
      setForceClosePriceError('');
    }
  }, [open, holding]);

  // 验证止盈价
  const validateSellPriceInput = (value: string) => {
    const price = parseFloat(value);
    if (value && !isNaN(price)) {
      const result = validateSellPrice(price, holding.costPrice, holding.currentPrice);
      setSellPriceError(result.error || '');
      return result.isValid;
    }
    setSellPriceError('');
    return false;
  };

  // 验证止损价
  const validateForceClosePriceInput = (value: string) => {
    const price = parseFloat(value);
    if (value && !isNaN(price)) {
      const result = validateForceClosePrice(price, holding.costPrice, holding.currentPrice);
      setForceClosePriceError(result.error || '');
      return result.isValid;
    }
    setForceClosePriceError('');
    return false;
  };

  // 处理保存
  const handleSave = async () => {
    const sellPriceNum = parseFloat(sellPrice);
    const forceClosePriceNum = parseFloat(forceClosePrice);

    // 验证两个价格
    const sellPriceValid = validateSellPriceInput(sellPrice);
    const forceClosePriceValid = validateForceClosePriceInput(forceClosePrice);

    if (!sellPriceValid || !forceClosePriceValid) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave(sellPriceNum, forceClosePriceNum);
      onOpenChange(false);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>设置止盈止损价格</span>
          </DialogTitle>
          <DialogDescription>
            {holding.stockName} ({holding.stockCode})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* 当前价格信息 */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30 border"
          >
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">当前价</p>
              <p className="text-base font-bold tabular-nums">¥{holding.currentPrice.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">成本价</p>
              <p className="text-base font-bold tabular-nums">¥{holding.costPrice.toFixed(2)}</p>
            </div>
          </motion.div>

          {/* 止盈价输入 */}
          <div className="space-y-2">
            <Label htmlFor="sellPrice" className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-red-600" />
              止盈价格
            </Label>
            <Input
              id="sellPrice"
              type="number"
              step="0.01"
              placeholder="输入止盈价格"
              value={sellPrice}
              onChange={(e) => {
                setSellPrice(e.target.value);
                validateSellPriceInput(e.target.value);
              }}
              className={sellPriceError ? 'border-destructive' : ''}
            />
            <AnimatePresence>
              {sellPriceError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 text-xs text-destructive"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{sellPriceError}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-xs text-muted-foreground">
              止盈价必须大于成本价 (¥{holding.costPrice.toFixed(2)}) 和当前价 (¥
              {holding.currentPrice.toFixed(2)})
            </p>
          </div>

          {/* 止损价输入 */}
          <div className="space-y-2">
            <Label htmlFor="forceClosePrice" className="flex items-center gap-2 text-sm font-medium">
              <TrendingDown className="h-4 w-4 text-green-600" />
              止损价格
            </Label>
            <Input
              id="forceClosePrice"
              type="number"
              step="0.01"
              placeholder="输入止损价格"
              value={forceClosePrice}
              onChange={(e) => {
                setForceClosePrice(e.target.value);
                validateForceClosePriceInput(e.target.value);
              }}
              className={forceClosePriceError ? 'border-destructive' : ''}
            />
            <AnimatePresence>
              {forceClosePriceError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 text-xs text-destructive"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{forceClosePriceError}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-xs text-muted-foreground">
              止损价必须小于成本价 (¥{holding.costPrice.toFixed(2)}) 和当前价 (¥
              {holding.currentPrice.toFixed(2)})
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              !sellPrice ||
              !forceClosePrice ||
              !!sellPriceError ||
              !!forceClosePriceError
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              '保存'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


