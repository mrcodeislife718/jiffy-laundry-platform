'use client';

export function Card({ children, className = '', hover = true }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        transition: hover ? 'box-shadow 0.3s' : 'none',
        cursor: hover ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (hover) e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        if (hover) e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{subtitle}</p>}
      </div>
      {icon && <div style={{ color: '#2563eb' }}>{icon}</div>}
    </div>
  );
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}

export function CardFooter({ children }) {
  return <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>{children}</div>;
}
