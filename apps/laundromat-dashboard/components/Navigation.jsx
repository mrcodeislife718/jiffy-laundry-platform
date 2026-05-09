'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '🏠 Home' },
    { href: '/orders', label: '📦 Orders' },
    { href: '/inventory', label: '📊 Inventory' },
    { href: '/reports', label: '📈 Reports' },
  ];

  return (
    <nav style={{
      background: 'white',
      borderBottom: `2px solid #e5e7eb`,
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
          <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: DARK_TEXT }}>Laundromat Ops</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  color: isActive ? 'white' : DARK_TEXT,
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
        </div>
      </div>
    </nav>
  );
}
