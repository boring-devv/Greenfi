"use client";

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/staking', label: 'Staking' },
  { href: '/admin/impact', label: 'Impact' },
];

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('greenfi_admin_token');
      localStorage.removeItem('greenfi_admin_user');
    }
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-neon-green/20 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-neon-green/20 border border-neon-green/40" />
            <div>
              <div className="font-semibold text-neon-green text-sm">GreenFi Admin</div>
              <div className="text-xs text-gray-400">Stake-to-Plant Protocol</div>
            </div>
          </div>
          <nav className="flex items-center space-x-4 text-sm">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'px-3 py-1 rounded-full transition-all',
                  pathname === item.href
                    ? 'bg-neon-green text-black shadow-[0_0_20px_rgba(0,255,136,0.5)]'
                    : 'text-gray-400 hover:text-neon-green hover:bg-neon-green/10'
                )}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 text-xs rounded-full border border-red-500/60 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
