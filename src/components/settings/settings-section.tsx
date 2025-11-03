import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  icon,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ 
        type: "spring",
        stiffness: 350,
        damping: 35,
        mass: 0.7,
      }}
      className={cn(
        'group relative',
        className
      )}
    >
      {/* 标题区域 - 极简线条风格 */}
      <div className="flex items-start gap-3 mb-6 pb-4 border-b border-border/30">
        {icon && (
          <motion.div
            className="flex-shrink-0 mt-0.5 text-muted-foreground/60"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.6 }}
          >
            {icon}
          </motion.div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground leading-tight mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* 内容区域 - 极简透明背景 */}
      <div className="space-y-0">
        {children}
      </div>
    </motion.div>
  );
}


