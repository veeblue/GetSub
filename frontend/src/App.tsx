import React, { useState, useEffect } from 'react';
import {
  Layout,
  Form,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Switch,
  message,
  Tabs
} from 'antd';
import {
  SettingOutlined,
  VideoCameraOutlined,
  TranslationOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import ConfigModal from './components/ConfigModal';
import './styles/theme.css';

import FileUpload from './components/FileUpload';
import VideoUrlInput from './components/VideoUrlInput';
import SubtitlePreview from './components/SubtitlePreview';
import { useSubtitleProcessing } from './hooks/useSubtitleProcessing';
import { translateSubtitles } from './services/api';
import { SubtitleRequest, SubtitleResponse } from './types';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { t, language } = useTheme();
  
  // 配置状态 - 简化版本，假设配置总是有效的
  const configStatus = { configured: true };
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [subtitleData, setSubtitleData] = useState<{
    originalSrt?: string;
    translatedSrt?: string;
    segments?: any[];
    duration?: number;
  }>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [translateTargetLanguage, setTranslateTargetLanguage] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);

  const getLanguageOptions = () => {
    if (language === 'en') {
      return [
        { value: 'auto', label: 'Auto Detect' },
        { value: 'zh', label: 'Chinese' },
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'ru', label: 'Russian' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'it', label: 'Italian' },
        { value: 'ar', label: 'Arabic' },
        { value: 'hi', label: 'Hindi' },
        { value: 'th', label: 'Thai' },
        { value: 'vi', label: 'Vietnamese' },
        { value: 'tr', label: 'Turkish' },
      ];
    } else if (language === 'zh-TW') {
      return [
        { value: 'auto', label: '自動檢測' },
        { value: 'zh', label: '中文' },
        { value: 'en', label: '英語' },
        { value: 'es', label: '西班牙語' },
        { value: 'fr', label: '法語' },
        { value: 'de', label: '德語' },
        { value: 'ja', label: '日語' },
        { value: 'ko', label: '韓語' },
        { value: 'ru', label: '俄語' },
        { value: 'pt', label: '葡萄牙語' },
        { value: 'it', label: '意大利語' },
        { value: 'ar', label: '阿拉伯語' },
        { value: 'hi', label: '印地語' },
        { value: 'th', label: '泰語' },
        { value: 'vi', label: '越南語' },
        { value: 'tr', label: '土耳其語' },
      ];
    } else if (language === 'ja') {
      return [
        { value: 'auto', label: '自動検出' },
        { value: 'zh', label: '中国語' },
        { value: 'en', label: '英語' },
        { value: 'es', label: 'スペイン語' },
        { value: 'fr', label: 'フランス語' },
        { value: 'de', label: 'ドイツ語' },
        { value: 'ja', label: '日本語' },
        { value: 'ko', label: '韓国語' },
        { value: 'ru', label: 'ロシア語' },
        { value: 'pt', label: 'ポルトガル語' },
        { value: 'it', label: 'イタリア語' },
        { value: 'ar', label: 'アラビア語' },
        { value: 'hi', label: 'ヒンディー語' },
        { value: 'th', label: 'タイ語' },
        { value: 'vi', label: 'ベトナム語' },
        { value: 'tr', label: 'トルコ語' },
      ];
    } else if (language === 'ko') {
      return [
        { value: 'auto', label: '자동 감지' },
        { value: 'zh', label: '중국어' },
        { value: 'en', label: '영어' },
        { value: 'es', label: '스페인어' },
        { value: 'fr', label: '프랑스어' },
        { value: 'de', label: '독일어' },
        { value: 'ja', label: '일본어' },
        { value: 'ko', label: '한국어' },
        { value: 'ru', label: '러시아어' },
        { value: 'pt', label: '포르투갈어' },
        { value: 'it', label: '이탈리아어' },
        { value: 'ar', label: '아랍어' },
        { value: 'hi', label: '힌디어' },
        { value: 'th', label: '태국어' },
        { value: 'vi', label: '베트남어' },
        { value: 'tr', label: '터키어' },
      ];
    } else if (language === 'fr') {
      return [
        { value: 'auto', label: 'Détection Auto' },
        { value: 'zh', label: 'Chinois' },
        { value: 'en', label: 'Anglais' },
        { value: 'es', label: 'Espagnol' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Allemand' },
        { value: 'ja', label: 'Japonais' },
        { value: 'ko', label: 'Coréen' },
        { value: 'ru', label: 'Russe' },
        { value: 'pt', label: 'Portugais' },
        { value: 'it', label: 'Italien' },
        { value: 'ar', label: 'Arabe' },
        { value: 'hi', label: 'Hindi' },
        { value: 'th', label: 'Thaï' },
        { value: 'vi', label: 'Vietnamien' },
        { value: 'tr', label: 'Turc' },
      ];
    } else if (language === 'de') {
      return [
        { value: 'auto', label: 'Automatische Erkennung' },
        { value: 'zh', label: 'Chinesisch' },
        { value: 'en', label: 'Englisch' },
        { value: 'es', label: 'Spanisch' },
        { value: 'fr', label: 'Französisch' },
        { value: 'de', label: 'Deutsch' },
        { value: 'ja', label: 'Japanisch' },
        { value: 'ko', label: 'Koreanisch' },
        { value: 'ru', label: 'Russisch' },
        { value: 'pt', label: 'Portugiesisch' },
        { value: 'it', label: 'Italienisch' },
        { value: 'ar', label: 'Arabisch' },
        { value: 'hi', label: 'Hindi' },
        { value: 'th', label: 'Thailändisch' },
        { value: 'vi', label: 'Vietnamesisch' },
        { value: 'tr', label: 'Türkisch' },
      ];
    } else if (language === 'es') {
      return [
        { value: 'auto', label: 'Detección Automática' },
        { value: 'zh', label: 'Chino' },
        { value: 'en', label: 'Inglés' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Francés' },
        { value: 'de', label: 'Alemán' },
        { value: 'ja', label: 'Japonés' },
        { value: 'ko', label: 'Coreano' },
        { value: 'ru', label: 'Ruso' },
        { value: 'pt', label: 'Portugués' },
        { value: 'it', label: 'Italiano' },
        { value: 'ar', label: 'Árabe' },
        { value: 'hi', label: 'Hindi' },
        { value: 'th', label: 'Tailandés' },
        { value: 'vi', label: 'Vietnamita' },
        { value: 'tr', label: 'Turco' },
      ];
    } else if (language === 'it') {
      return [
        { value: 'auto', label: 'Rilevamento Automatico' },
        { value: 'zh', label: 'Cinese' },
        { value: 'en', label: 'Inglese' },
        { value: 'es', label: 'Spagnolo' },
        { value: 'fr', label: 'Francese' },
        { value: 'de', label: 'Tedesco' },
        { value: 'ja', label: 'Giapponese' },
        { value: 'ko', label: 'Coreano' },
        { value: 'ru', label: 'Russo' },
        { value: 'pt', label: 'Portoghese' },
        { value: 'it', label: 'Italiano' },
        { value: 'ar', label: 'Arabo' },
        { value: 'hi', label: 'Hindi' },
        { value: 'th', label: 'Tailandese' },
        { value: 'vi', label: 'Vietnamita' },
        { value: 'tr', label: 'Turco' },
      ];
    } else if (language === 'pt') {
      return [
        { value: 'auto', label: 'Detecção Automática' },
        { value: 'zh', label: 'Chinês' },
        { value: 'en', label: 'Inglês' },
        { value: 'es', label: 'Espanhol' },
        { value: 'fr', label: 'Francês' },
        { value: 'de', label: 'Alemão' },
        { value: 'ja', label: 'Japonês' },
        { value: 'ko', label: 'Coreano' },
        { value: 'ru', label: 'Russo' },
        { value: 'pt', label: 'Português' },
        { value: 'it', label: 'Italiano' },
        { value: 'ar', label: 'Árabe' },
        { value: 'hi', label: 'Hindi' },
        { value: 'th', label: 'Tailandês' },
        { value: 'vi', label: 'Vietnamita' },
        { value: 'tr', label: 'Turco' },
      ];
    } else if (language === 'ru') {
      return [
        { value: 'auto', label: 'Автоопределение' },
        { value: 'zh', label: 'Китайский' },
        { value: 'en', label: 'Английский' },
        { value: 'es', label: 'Испанский' },
        { value: 'fr', label: 'Французский' },
        { value: 'de', label: 'Немецкий' },
        { value: 'ja', label: 'Японский' },
        { value: 'ko', label: 'Корейский' },
        { value: 'ru', label: 'Русский' },
        { value: 'pt', label: 'Португальский' },
        { value: 'it', label: 'Итальянский' },
        { value: 'ar', label: 'Арабский' },
        { value: 'hi', label: 'Хинди' },
        { value: 'th', label: 'Тайский' },
        { value: 'vi', label: 'Вьетнамский' },
        { value: 'tr', label: 'Турецкий' },
      ];
    } else if (language === 'ar') {
      return [
        { value: 'auto', label: 'اكتشاف تلقائي' },
        { value: 'zh', label: 'الصينية' },
        { value: 'en', label: 'الإنجليزية' },
        { value: 'es', label: 'الإسبانية' },
        { value: 'fr', label: 'الفرنسية' },
        { value: 'de', label: 'الألمانية' },
        { value: 'ja', label: 'اليابانية' },
        { value: 'ko', label: 'الكورية' },
        { value: 'ru', label: 'الروسية' },
        { value: 'pt', label: 'البرتغالية' },
        { value: 'it', label: 'الإيطالية' },
        { value: 'ar', label: 'العربية' },
        { value: 'hi', label: 'الهندية' },
        { value: 'th', label: 'التايلاندية' },
        { value: 'vi', label: 'الفيتنامية' },
        { value: 'tr', label: 'التركية' },
      ];
    } else if (language === 'hi') {
      return [
        { value: 'auto', label: 'ऑटो डिटेक्ट' },
        { value: 'zh', label: 'चीनी' },
        { value: 'en', label: 'अंग्रेजी' },
        { value: 'es', label: 'स्पैनिश' },
        { value: 'fr', label: 'फ्रेंच' },
        { value: 'de', label: 'जर्मन' },
        { value: 'ja', label: 'जापानी' },
        { value: 'ko', label: 'कोरियाई' },
        { value: 'ru', label: 'रूसी' },
        { value: 'pt', label: 'पुर्तगाली' },
        { value: 'it', label: 'इतालवी' },
        { value: 'ar', label: 'अरबी' },
        { value: 'hi', label: 'हिंदी' },
        { value: 'th', label: 'थाई' },
        { value: 'vi', label: 'वियतनामी' },
        { value: 'tr', label: 'तुर्की' },
      ];
    } else if (language === 'th') {
      return [
        { value: 'auto', label: 'ตรวจจับอัตโนมัติ' },
        { value: 'zh', label: 'จีน' },
        { value: 'en', label: 'อังกฤษ' },
        { value: 'es', label: 'สเปน' },
        { value: 'fr', label: 'ฝรั่งเศส' },
        { value: 'de', label: 'เยอรมัน' },
        { value: 'ja', label: 'ญี่ปุ่น' },
        { value: 'ko', label: 'เกาหลี' },
        { value: 'ru', label: 'รัสเซีย' },
        { value: 'pt', label: 'โปรตุเกส' },
        { value: 'it', label: 'อิตาลี' },
        { value: 'ar', label: 'อารบิก' },
        { value: 'hi', label: 'ฮินดี' },
        { value: 'th', label: 'ไทย' },
        { value: 'vi', label: 'เวียดนาม' },
        { value: 'tr', label: 'ตุรกี' },
      ];
    } else if (language === 'vi') {
      return [
        { value: 'auto', label: 'Tự động phát hiện' },
        { value: 'zh', label: 'Trung Quốc' },
        { value: 'en', label: 'Tiếng Anh' },
        { value: 'es', label: 'Tây Ban Nha' },
        { value: 'fr', label: 'Pháp' },
        { value: 'de', label: 'Đức' },
        { value: 'ja', label: 'Nhật Bản' },
        { value: 'ko', label: 'Hàn Quốc' },
        { value: 'ru', label: 'Nga' },
        { value: 'pt', label: 'Bồ Đào Nha' },
        { value: 'it', label: 'Ý' },
        { value: 'ar', label: 'Ả Rập' },
        { value: 'hi', label: 'Hindi' },
        { value: 'th', label: 'Thái Lan' },
        { value: 'vi', label: 'Tiếng Việt' },
        { value: 'tr', label: 'Thổ Nhĩ Kỳ' },
      ];
    } else if (language === 'tr') {
      return [
        { value: 'auto', label: 'Otomatik Algılama' },
        { value: 'zh', label: 'Çince' },
        { value: 'en', label: 'İngilizce' },
        { value: 'es', label: 'İspanyolca' },
        { value: 'fr', label: 'Fransızca' },
        { value: 'de', label: 'Almanca' },
        { value: 'ja', label: 'Japonca' },
        { value: 'ko', label: 'Korece' },
        { value: 'ru', label: 'Rusça' },
        { value: 'pt', label: 'Portekizce' },
        { value: 'it', label: 'İtalyanca' },
        { value: 'ar', label: 'Arapça' },
        { value: 'hi', label: 'Hintçe' },
        { value: 'th', label: 'Tayca' },
        { value: 'vi', label: 'Vietnamca' },
        { value: 'tr', label: 'Türkçe' },
      ];
    } else {
      return [
        { value: 'auto', label: '自动检测' },
        { value: 'zh', label: '中文' },
        { value: 'en', label: '英语' },
        { value: 'es', label: '西班牙语' },
        { value: 'fr', label: '法语' },
        { value: 'de', label: '德语' },
        { value: 'ja', label: '日语' },
        { value: 'ko', label: '韩语' },
        { value: 'ru', label: '俄语' },
        { value: 'pt', label: '葡萄牙语' },
        { value: 'it', label: '意大利语' },
        { value: 'ar', label: '阿拉伯语' },
        { value: 'hi', label: '印地语' },
        { value: 'th', label: '泰语' },
        { value: 'vi', label: '越南语' },
        { value: 'tr', label: '土耳其语' },
      ];
    }
  };

  const languageOptions = getLanguageOptions();

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const {
    processingStatus,
    processFile,
    processUrl,
    resetStatus,
    isLoading
  } = useSubtitleProcessing();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVideoUrl('');
    resetStatus();
    setSubtitleData({});
  };

  const handleVideoUrlSelect = (url: string) => {
    setVideoUrl(url);
    setSelectedFile(null);
    resetStatus();
    setSubtitleData({});
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    resetStatus();
    setSubtitleData({});
  };

  const handleGenerateSubtitles = async (values: SubtitleRequest) => {
    console.log('handleGenerateSubtitles called', { 
      selectedFile: !!selectedFile, 
      videoUrl: videoUrl.trim(), 
      configStatus,
      values 
    });
    
    if (!selectedFile && !videoUrl.trim()) {
      console.log('No file or URL provided');
      message.error(t('error.no_file'));
      return;
    }

        
    console.log('Starting subtitle generation...');

    try {
      if (selectedFile) {
        const result: SubtitleResponse = await processFile(selectedFile, values);
        
        if (result.success) {
          setSubtitleData({
            originalSrt: result.original_srt,
            translatedSrt: result.translated_srt,
            segments: result.segments,
            duration: result.duration
          });
        }
      } else if (videoUrl.trim()) {
        const result: SubtitleResponse = await processUrl(videoUrl, values);
        
        if (result.success) {
          setSubtitleData({
            originalSrt: result.original_srt,
            translatedSrt: result.translated_srt,
            segments: result.segments,
            duration: result.duration
          });
        }
      }
    } catch (error) {
      console.error('Generate subtitles failed:', error);
    }
  };

  const handleSubtitleEdit = (originalSrt?: string, translatedSrt?: string) => {
    setSubtitleData(prev => ({
      ...prev,
      originalSrt: originalSrt || prev.originalSrt,
      translatedSrt: translatedSrt || prev.translatedSrt
    }));
  };

  const handleTranslateSubtitles = async () => {
    if (!subtitleData.originalSrt || !translateTargetLanguage) {
      return;
    }

    
    setIsTranslating(true);
    try {
      const result = await translateSubtitles(subtitleData.originalSrt, translateTargetLanguage);
      
      if (result.success && result.translated_srt) {
        setSubtitleData(prev => ({
          ...prev,
          translatedSrt: result.translated_srt
        }));
        
        // 检查翻译结果是否包含失败标记
        if (result.translated_srt.includes('[Translation failed]')) {
          message.warning('Translation partially completed. Some segments may not have been translated correctly.');
        } else {
          message.success(t('translation.success'));
        }
      } else {
        message.error(result.message || t('translation.error'));
        
              }
    } catch (error) {
      console.error('Translation failed:', error);
      message.error(t('translation.error'));
    } finally {
      setIsTranslating(false);
    }
  };

  const getProcessingIcon = () => {
    switch (processingStatus.status) {
      case 'uploading':
        return <VideoCameraOutlined />;
      case 'processing':
        return <TranslationOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'error':
        return <ExclamationCircleOutlined />;
      default:
        return <PlayCircleOutlined />;
    }
  };

  const getProcessingColor = () => {
    switch (processingStatus.status) {
      case 'uploading':
      case 'processing':
        return 'var(--primary-color)';
      case 'completed':
        return 'var(--success-color)';
      case 'error':
        return 'var(--error-color)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--background-primary)', margin: 0, padding: 0 }} className="app-container">
      <Header className={`fixed-nav ${isScrolled ? 'nav-scrolled' : ''} glass-effect`} style={{ 
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'auto',
        lineHeight: 1,
        marginTop: '0',
        marginLeft: '0',
        marginRight: '0',
        left: '0',
        right: '0',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
            transition: 'all 0.3s ease'
          }}
          className="hover-lift">
            <VideoCameraOutlined style={{ fontSize: '20px', color: 'white' }} />
          </div>
          <Title level={2} style={{ 
            color: 'var(--text-primary)', 
            margin: 0,
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {t('app.title')}
          </Title>
        </div>
        
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LanguageSwitcher />
        <ThemeSwitcher />
          <div
            className="nav-dropdown-trigger"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              transition: 'all 0.3s ease', 
              border: '1px solid var(--glass-border)', 
              background: 'var(--glass-bg)', 
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => setConfigModalVisible(true)}
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; 
              e.currentTarget.style.transform = 'translateY(-1px)'; 
            }} 
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = 'var(--glass-bg)'; 
              e.currentTarget.style.transform = 'translateY(0)'; 
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setConfigModalVisible(true);
              }
            }}
          >
            <SettingOutlined style={{ color: 'var(--text-primary)', fontSize: '16px' }} />
            <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
              {t('nav.settings')}
            </span>
          </div>
        </div>
      </Header>

      <Content style={{ 
        padding: '80px 60px 60px', 
        background: 'var(--background-secondary)',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          {/* 处理状态 */}
          {processingStatus.status !== 'idle' && (
            <div className="card-elevated slide-up" style={{
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div className="status-indicator" style={{ 
                fontSize: '28px', 
                color: getProcessingColor(),
                flexShrink: 0
              }}>
                {getProcessingIcon()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {processingStatus.message}
                </div>
                {processingStatus.progress !== undefined && (
                  <div style={{ width: '100%' }}>
                    <div style={{
                      height: '6px',
                      background: 'var(--border-color)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${processingStatus.progress}%`,
                        background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease',
                        boxShadow: '0 0 12px rgba(0, 122, 255, 0.3)'
                      }} />
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
                      {Math.round(processingStatus.progress)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 文件/视频输入 */}
          <div className="card-elevated fade-in" style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '40px'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
              {t('source.select')}
            </div>
            
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange} 
              centered
              className="custom-tabs"
              style={{
                background: 'var(--surface-secondary)',
                borderRadius: '12px',
                padding: '8px',
                marginBottom: '24px'
              }}
            >
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 500 }}>
                    <CloudUploadOutlined style={{ marginRight: '8px' }} />
                    {t('tab.local')}
                  </span>
                } 
                key="file"
              >
                <div className="fade-in">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    disabled={isLoading}
                  />
                </div>
              </TabPane>
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 500 }}>
                    <LinkOutlined style={{ marginRight: '8px' }} />
                    {t('tab.online')}
                  </span>
                } 
                key="url"
              >
                <div className="fade-in">
                  <VideoUrlInput
                    onUrlSelect={handleVideoUrlSelect}
                    disabled={isLoading}
                    loading={isLoading}
                  />
                </div>
              </TabPane>
            </Tabs>
            
            {/* 源语言选择和生成按钮 */}
            {(selectedFile || videoUrl.trim()) && (
              <div style={{
                background: 'var(--surface-secondary)',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '24px'
              }}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleGenerateSubtitles}
                  onFinishFailed={(errorInfo) => {
                    console.log('Form validation failed:', errorInfo);
                  }}
                  onValuesChange={(_, allValues) => {
                    console.log('Form values changed:', allValues);
                  }}
                  initialValues={{
                    source_language: 'auto'
                  }}
                >
                  <Row gutter={16} align="bottom">
                    <Col span={18}>
                      <Form.Item
                        name="source_language"
                        label={<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{t('options.source')}</span>}
                        rules={[{ required: true, message: t('options.source') }]}
                        style={{ marginBottom: '0' }}
                      >
                        <Select>
                          {languageOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item style={{ marginBottom: '0' }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={isLoading}
                          disabled={activeTab === 'url' && !videoUrl.trim()}
                          onClick={() => {
                            console.log('Button clicked!');
                            console.log('Form values:', form.getFieldsValue());
                          }}
                          className="animated-gradient"
                          style={{
                            width: '100%',
                            height: '48px',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(0, 122, 255, 0.3)',
                            transition: 'all 0.3s ease',
                            opacity: (activeTab === 'url' && !videoUrl.trim()) ? 0.6 : 1
                          }}
                          icon={<PlayCircleOutlined />}
                        >
                          {isLoading ? t('button.processing') : t('button.generate')}
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}
          </div>


          {/* 字幕预览 */}
          {(subtitleData.originalSrt || subtitleData.translatedSrt) && (
            <div className="card-elevated slide-up" style={{
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '40px'
            }}>
              {/* 翻译选项 */}
              {subtitleData.originalSrt && (
                <div style={{
                  background: 'var(--surface-secondary)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    <TranslationOutlined style={{ marginRight: '8px' }} />
                    {t('translation.title')}
                  </div>
                  <Row gutter={16} align="bottom">
                    <Col span={18}>
                      <Form.Item
                        label={<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{t('translation.target')}</span>}
                        style={{ marginBottom: '0' }}
                      >
                        <Select
                          placeholder={t('translation.select_language')}
                          value={translateTargetLanguage}
                          onChange={(value) => {
                            setTranslateTargetLanguage(value);
                          }}
                        >
                          {languageOptions
                            .filter(option => option.value !== 'auto')
                            .map(option => (
                              <Option key={option.value} value={option.value}>
                                {option.label}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Button
                        type="primary"
                        loading={isTranslating}
                        disabled={!translateTargetLanguage}
                        onClick={handleTranslateSubtitles}
                        style={{
                          width: '100%',
                          height: '48px',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'white',
                          boxShadow: '0 8px 32px rgba(0, 122, 255, 0.3)',
                          transition: 'all 0.3s ease',
                          opacity: !translateTargetLanguage ? 0.6 : 1
                        }}
                        icon={<TranslationOutlined />}
                      >
                        {isTranslating ? t('translation.translating') : t('translation.translate')}
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}
              
              <SubtitlePreview
                originalSrt={subtitleData.originalSrt}
                translatedSrt={subtitleData.translatedSrt}
                onEdit={handleSubtitleEdit}
                showDownload={true}
              />
            </div>
          )}

          {/* 使用说明 */}
          <div className="card-elevated fade-in" style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '40px'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
              {t('usage.title')}
            </div>
            <Row gutter={32}>
              <Col span={12}>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {t('usage.quickstart')}
                </div>
                <ol style={{ 
                  fontSize: '15px', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  paddingLeft: '20px'
                }}>
                  <li style={{ marginBottom: '8px' }}>{t('usage.step1')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('usage.step2')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('usage.step3')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('usage.step4')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('usage.step5')}</li>
                  <li>{t('usage.step6')}</li>
                </ol>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {t('usage.features')}
                </div>
                <ul style={{ 
                  fontSize: '15px', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  paddingLeft: '20px'
                }}>
                  <li style={{ marginBottom: '8px' }}>{t('feature.audio')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('feature.video')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('feature.online')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('feature.preview')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('feature.translate')}</li>
                  <li style={{ marginBottom: '8px' }}>{t('feature.config')}</li>
                  <li>{t('feature.download')}</li>
                </ul>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        padding: '40px 60px',
        background: 'var(--surface-primary)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}
        </div>
      </Footer>

      {/* API配置模态框 */}
      <ConfigModal
        visible={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
      />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;