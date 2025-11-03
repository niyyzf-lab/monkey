import { ReactNode } from 'react';
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
    <div className={cn(
      'flex items-center justify-between gap-6 py-4 px-0 transition-colors duration-150',
      'border-b border-border/20 last:border-0',
      'hover:bg-muted/30 -mx-1 px-1 rounded-sm',
      className
    )}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground leading-snug">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">{description}</div>
        )}
        {hint && (
          <div className="text-[10px] text-muted-foreground/60 mt-1 leading-relaxed font-mono">
            {hint}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}


