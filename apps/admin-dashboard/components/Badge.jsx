'use client';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: { bg: '#f3f4f6', color: '#111827' },
    primary: { bg: '#dbeafe', color: '#1e40af' },
    success: { bg: '#dcfce7', color: '#15803d' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    danger: { bg: '#fee2e2', color: '#991b1b' },
  };

  const style = variants[variant];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.375rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        background: style.bg,
        color: style.color,
      }}
    >
      {children}
    </span>
  );
}
