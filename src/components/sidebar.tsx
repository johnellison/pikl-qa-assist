'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Phone, Users, Upload, Settings, BarChart, Moon, Sun, ShieldCheck, FileText } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  subItems?: Array<{ title: string; href: string }>;
}

const sidebarNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Calls',
    href: '/calls',
    icon: Phone,
  },
  {
    title: 'Agents',
    href: '/agents',
    icon: Users,
  },
  {
    title: 'Upload',
    href: '/upload',
    icon: Upload,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart,
    subItems: [
      { title: 'QA Log', href: '/reports/qa-log' },
    ],
  },
  {
    title: 'Compliance Rules',
    href: '/admin/compliance-rules',
    icon: ShieldCheck,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      {/* Brand */}
      <div className="h-14 flex items-center border-b px-6">
        <Link href="/" className="flex flex-col">
          <span className="font-bold text-xl leading-none">Pikl</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">QA Assist</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-4">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const hasActiveSubItem = item.subItems?.some(sub => pathname === sub.href);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                    isActive || hasActiveSubItem
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.title}</span>
                </Link>

                {/* Sub-items */}
                {item.subItems && item.subItems.length > 0 && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          prefetch={false}
                          className={cn(
                            'flex items-center rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                            isSubActive
                              ? 'bg-accent/50 text-accent-foreground font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4 space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="h-8 w-16 px-2"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4 mr-1" />
                <span className="text-xs">Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 mr-1" />
                <span className="text-xs">Light</span>
              </>
            )}
          </Button>
        </div>

        {/* Version Info */}
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Pikl QA Assistant</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
