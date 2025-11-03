import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  label: string;
  description?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsItem({
  label,
  description,
  hint,
  children,
  className,
}: SettingsItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ 
        type: "spring",
        stiffness: 350,
        damping: 35,
        mass: 0.7,
      }}
      whileHover={{ x: 2 }}
      className={cn(
        'flex items-center justify-between gap-6 py-4 px-0 transition-all duration-200',
        'border-b border-border/20 last:border-0',
        'hover:bg-muted/40 -mx-1 px-1 rounded-md',
        'group',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground leading-snug transition-colors duration-200 group-hover:text-foreground/90">
          {label}
        </div>
        {description && (
          <div className="text-xs text-muted-foreground/80 mt-1 leading-relaxed transition-opacity duration-200 group-hover:opacity-100">
            {description}
          </div>
        )}
        {hint && (
          <div className="text-[10px] text-muted-foreground/60 mt-1 leading-relaxed font-mono transition-opacity duration-200 group-hover:opacity-80">
            {hint}
          </div>
        )}
      </div>
      <motion.div 
        className="flex-shrink-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.6 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}


