import React from 'react';
import { Switch, Dropdown } from 'antd';
import { BulbOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const items = [
    {
      key: 'light',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BulbOutlined />
          <span>浅色模式</span>
        </div>
      ),
    },
    {
      key: 'dark',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MoonOutlined />
          <span>深色模式</span>
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items, onClick: ({ key }) => setTheme(key as any) }}
      placement="bottomRight"
    >
        <div className="nav-dropdown-trigger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
        {theme === 'light' ? (
          <BulbOutlined style={{ color: 'var(--text-primary)', fontSize: '16px' }} />
        ) : (
          <MoonOutlined style={{ color: 'var(--text-primary)', fontSize: '16px' }} />
        )}
        <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
          {theme === 'light' ? '浅色' : '深色'}
        </span>
      </div>
    </Dropdown>
  );
};

export default ThemeSwitcher;