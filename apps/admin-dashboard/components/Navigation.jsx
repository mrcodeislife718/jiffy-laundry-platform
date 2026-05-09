'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function Navigation() {
  const pathname = usePathname();
  const { colors, isDark, setIsDark } = useTheme();

  const navItems = [
    // OPERATIONS
    { section: 'OPERATIONS', label: 'Live Center', href: '/', icon: '🎛️' },
    { label: 'Orders', href: '/orders', icon: '📦' },
    { label: 'Drivers', href: '/drivers', icon: '🚗' },
    { label: 'Dispatch', href: '/dispatch', icon: '🚚' },
    { label: 'SLA Monitor', href: '/sla', icon: '⏰' },
    
    // MANAGEMENT
    { section: 'MANAGEMENT', label: 'Facilities', href: '/facilities', icon: '🏭' },
    { label: 'Support', href: '/support', icon: '💬' },
    { label: 'Finance', href: '/finance', icon: '💰' },
    
    // INTELLIGENCE
    { section: 'INTELLIGENCE', label: 'Analytics', href: '/analytics', icon: '📊' },
    { label: 'Audit Log', href: '/audit', icon: '📋' },
    { label: 'Reports', href: '/reports', icon: '📈' },
    
    // CONFIGURATION
    { section: 'CONFIGURATION', label: 'Roles & Access', href: '/roles', icon: '👥' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <nav style={{
      width: '280px',
      background: colors.bgSecondary,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0 1.5rem',
        marginBottom: '2rem',
        textDecoration: 'none',
      }}>
        <img src="/JiffyLaundry Logo Variations with Effects (1).png" alt="JiffyLaundry" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: colors.primary }}>JiffyLaundry</div>
          <div style={{ fontSize: '0.65rem', color: colors.text }}>Admin</div>
        </div>
      </Link>

      {/* Nav Items */}
      <div style={{ flex: 1 }}>
        {navItems.map((item, idx) => {
          const active = isActive(item.href);
          const sectionHeader = item.section ? (
            <div key={`s-${idx}`} style={{
              padding: '1rem 1.5rem 0.5rem 1.5rem',
              marginTop: idx > 0 ? '0.5rem' : 0,
              fontSize: '0.65rem',
              fontWeight: '700',
              color: colors.textSecondary,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {item.section}
            </div>
          ) : null;

          if (!item.href) {
            return sectionHeader;
          }

          return (
            <div key={item.href}>
              {sectionHeader}
              <Link
                href={item.href}
                style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.5rem',
                color: active ? colors.primary : colors.text,
                textDecoration: 'none',
                fontSize: '0.9375rem',
                fontWeight: active ? '600' : '500',
                background: active ? (isDark ? '#1e3a4c' : '#fff3f0') : 'transparent',
                borderLeft: active ? `4px solid ${colors.primary}` : '4px solid transparent',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
            </div>
          );
        })}
      </div>

      {/* Theme Toggle */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        marginBottom: '1rem',
      }}>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: `1px solid ${colors.border}`,
            background: colors.bgTertiary,
            color: colors.text,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#475569' : '#e5e7eb'}
          onMouseLeave={(e) => e.currentTarget.style.background = colors.bgTertiary}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Footer */}
      <div style={{
        padding: '1.5rem',
        borderTop: `1px solid ${colors.border}`,
        textAlign: 'center',
        fontSize: '0.75rem',
        color: colors.textSecondary,
      }}>
        <p style={{ margin: 0 }}>© 2026 Jiffy Laundry</p>
      </div>
    </nav>
  );
}
