import { motion } from 'motion/react';
import { Receipt } from 'lucide-react';

export function OperationsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/30 mb-3"
      >
        <Receipt className="h-6 w-6 text-muted-foreground/50" />
      </motion.div>
      
      <p className="text-sm text-muted-foreground">
        暂无交易记录
      </p>
    </motion.div>
  );
}
