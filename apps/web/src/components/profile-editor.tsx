// apps/web/src/components/profile-editor.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useGameStore } from '@/lib/game-store';
import { type ThemeId } from '@/types';
import { ThemeSelector } from './theme-selector';

interface ProfileEditorProps {
  onClose: () => void;
}

export function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { address } = useAccount();
  const { currentPlayer, updatePlayer } = useGameStore();
  
  const [name, setName] = useState(currentPlayer?.name || '');
  const [desc, setDesc] = useState(currentPlayer?.description || '');
  const [theme, setTheme] = useState<ThemeId>(currentPlayer?.theme || 'default');
  const [avatar, setAvatar] = useState(currentPlayer?.avatar || '');
  const [linkName, setLinkName] = useState(currentPlayer?.links?.[0] || '');
  const [linkUrl, setLinkUrl] = useState(currentPlayer?.links?.[1] || '');

  const handleSave = () => {
    updatePlayer({ 
      name: name || `Player ${address?.slice(2, 8)}`, 
      description: desc.slice(0, 500), 
      theme, 
      avatar, 
      links: linkName && linkUrl ? [linkName, linkUrl] as [string, string] : undefined 
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: '#1f2937', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: '20px', color: 'white' }}>✏️ Редактировать профиль</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Имя" maxLength={30} style={{ padding: '10px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '8px' }} />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Описание (до 500 символов)" maxLength={500} rows={3} style={{ padding: '10px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '8px', resize: 'vertical' }} />
          <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="URL аватара" style={{ padding: '10px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '8px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
            <input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="Название ссылки" style={{ padding: '8px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '6px' }} />
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." style={{ padding: '8px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '6px' }} />
          </div>
          <ThemeSelector value={theme} onChange={setTheme} />
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>💾 Сохранить</button>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  );
}