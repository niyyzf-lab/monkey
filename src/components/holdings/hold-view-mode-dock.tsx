import { LayoutGrid, Table2, List } from 'lucide-react';
import { motion } from 'motion/react';
import { ViewMode } from '../../hooks/use-view-preferences';

interface ViewModeDockProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeDock({ viewMode, onViewModeChange }: ViewModeDockProps) {
  const modes = [
    { value: 'card' as ViewMode, icon: LayoutGrid },
    { value: 'table' as ViewMode, icon: Table2 },
    { value: 'compact' as ViewMode, icon: List },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      style={{ 
        transform: 'translateX(-50%)',
        left: '50%'
      }}
    >
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/40 dark:border-border/30 shadow-[0_4px_16px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = viewMode === mode.value;
          
          return (
            <motion.button
              key={mode.value}
              onClick={() => onViewModeChange(mode.value)}
              className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 活跃背景 */}
              {isActive && (
                <motion.div
                  layoutId="active-dock-bg"
                  className="absolute inset-0 bg-primary rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] border border-primary/20"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
              
              {/* 图标 */}
              <Icon className="relative z-10 h-5 w-5" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

