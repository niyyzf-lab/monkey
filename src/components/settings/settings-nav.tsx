import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Database, Settings as SettingsIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'appearance', label: '外观', icon: Palette },
  { id: 'data', label: '数据', icon: Database },
  { id: 'system', label: '交易', icon: SettingsIcon },
  { id: 'about', label: '关于', icon: Info },
];

interface SettingsNavProps {
  className?: string;
}

export function SettingsNav({ className }: SettingsNavProps) {
  const [activeId, setActiveId] = useState<string>('appearance');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 观察所有锚点元素
    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn(
        'hidden xl:block fixed right-4 top-24 z-10',
        className
      )}
    >
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors relative group',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavDot"
                  className="absolute left-0 w-1 h-1 bg-foreground rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={cn(
                'h-3.5 w-3.5 transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              <span className="whitespace-nowrap">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </motion.div>
  );
}

