'use client';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    primary: { bg: '#2563eb', color: 'white', hoverBg: '#1d4ed8' },
    secondary: { bg: '#e5e7eb', color: '#111827', hoverBg: '#d1d5db' },
    danger: { bg: '#dc2626', color: 'white', hoverBg: '#b91c1c' },
    success: { bg: '#16a34a', color: 'white', hoverBg: '#15803d' },
    outline: { bg: 'transparent', color: '#2563eb', border: '2px solid #2563eb', hoverBg: '#f0f4ff' },
  };

  const sizes = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.5rem 1rem', fontSize: '1rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
  };

  const variant_style = variants[variant];
  const size_style = sizes[size];

  return (
    <button
      style={{
        ...size_style,
        background: variant_style.bg,
        color: variant_style.color,
        border: variant_style.border || 'none',
        borderRadius: '0.375rem',
        fontWeight: '600',
        transition: 'background-color 0.2s',
        cursor: 'pointer',
        ...props.style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = variant_style.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = variant_style.bg;
      }}
      {...props}
    >
      {children}
    </button>
  );
}
