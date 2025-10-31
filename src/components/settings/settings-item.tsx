import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsItem({
  label,
  description,
  children,
  className,
}: SettingsItemProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-2.5 border-b border-border/30 last:border-0', className)}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground leading-snug">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}


