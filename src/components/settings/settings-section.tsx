import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
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
    <Card className={cn('p-4 border border-border/50 bg-card shadow-sm', className)}>
      <div className="flex items-start gap-3 mb-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </Card>
  );
}


