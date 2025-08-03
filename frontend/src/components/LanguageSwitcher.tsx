import React from 'react';
import { Select, Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const { Option } = Select;

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTheme();

  const languageOptions = [
    { value: 'zh', label: '简体中文', flag: '🇨🇳' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'zh-TW', label: '繁體中文', flag: '🇭🇰' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'pt', label: 'Português', flag: '🇵🇹' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
    { value: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { value: 'th', label: 'ไทย', flag: '🇹🇭' },
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  const items = languageOptions.map(option => ({
    key: option.value,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{option.flag}</span>
        <span>{option.label}</span>
      </div>
    ),
  }));

  return (
    <Dropdown
      menu={{ items, onClick: ({ key }) => setLanguage(key as any) }}
      placement="bottomRight"
    >
        <div className="nav-dropdown-trigger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
        <GlobalOutlined style={{ color: 'var(--text-primary)', fontSize: '16px' }} />
        <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
          {languageOptions.find(opt => opt.value === language)?.flag}
        </span>
      </div>
    </Dropdown>
  );
};

export default LanguageSwitcher;