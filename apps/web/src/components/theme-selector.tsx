// apps/web/src/components/theme-selector.tsx
'use client';

import { THEMES, type ThemeId } from '@/types';

interface ThemeSelectorProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
      {(Object.entries(THEMES) as [ThemeId, typeof THEMES[ThemeId]][]).map(([id, theme]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={theme.name}
          style={{
            padding: '12px',
            background: theme.colors.bg,
            color: theme.colors.text,
            border: value === id ? `2px solid ${theme.colors.accent}` : '2px solid #374151',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ width: '20px', height: '20px', background: theme.colors.accent, borderRadius: '50%', margin: '0 auto 4px' }} />
          <span style={{ fontSize: '11px' }}>{theme.name}</span>
        </button>
      ))}
    </div>
  );
}