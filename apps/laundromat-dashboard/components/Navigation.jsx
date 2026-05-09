'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const ORANGE = '#ff6b35';

export default function Navigation() {
  const pathname = usePathname();
  const { colors, isDark, setIsDark } = useTheme();

  const navItems = [
    { href: '/', label: '🏠 Home' },
    { href: '/orders', label: '📦 Orders' },
    { href: '/inventory', label: '📊 Inventory' },
    { href: '/reports', label: '📈 Reports' },
  ];

  return (
    <nav style={{
      background: colors.bgSecondary,
      borderBottom: `2px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '90rem',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src="/JiffyLaundry Logo.png" alt="JiffyLaundry" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: colors.text }}>Laundromat Ops</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  background: isActive ? ORANGE : 'transparent',
                  color: isActive ? 'white' : colors.text,
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            style={{
              marginLeft: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: `1px solid ${colors.border}`,
              background: colors.bgTertiary,
              color: colors.text,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </nav>
  );
}
