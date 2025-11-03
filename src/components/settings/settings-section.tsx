import { ReactNode } from 'react';
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
    <div className={cn(
      'group relative',
      className
    )}>
      {/* 标题区域 - 极简线条风格 */}
      <div className="flex items-start gap-3 mb-6 pb-4 border-b border-border/30">
        {icon && (
          <div className="flex-shrink-0 mt-0.5 text-muted-foreground/60">
            {icon}
          </div>
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
    </div>
  );
}


