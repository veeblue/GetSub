import React, { useState } from 'react';
import {
  Input,
  Button,
  Typography,
  Form,
  message
} from 'antd';
import {
  LinkOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

interface VideoUrlInputProps {
  onUrlSelect: (url: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const VideoUrlInput: React.FC<VideoUrlInputProps> = ({
  onUrlSelect,
  disabled = false,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [urlHistory, setUrlHistory] = useState<string[]>([]);

  const handleSubmit = (values: any) => {
    // 如果URL为空，直接调用回调函数
    if (!values.url || !values.url.trim()) {
      onUrlSelect('');
      return;
    }

    // 添加到历史记录
    if (!urlHistory.includes(values.url)) {
      const newHistory = [values.url, ...urlHistory.slice(0, 4)];
      setUrlHistory(newHistory);
      localStorage.setItem('videoUrlHistory', JSON.stringify(newHistory));
    }

    onUrlSelect(values.url);
  };

  // 自动提交处理
  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const url = e.target.value;
    form.setFieldsValue({ url });
    
    // 延迟提交，避免频繁调用
    clearTimeout((window as any).urlSubmitTimeout);
    (window as any).urlSubmitTimeout = setTimeout(() => {
      if (url.trim()) {
        handleSubmit({ url });
      } else {
        onUrlSelect('');
      }
    }, 500);
  };

  const handleQuickSubmit = (url: string) => {
    form.setFieldsValue({ url });
    handleSubmit({ url });
  };

  const clearHistory = () => {
    setUrlHistory([]);
    localStorage.removeItem('videoUrlHistory');
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    
    // 仅支持直接音频文件URL
    const audioRegex = /^(https?:\/\/).+\.(mp3|wav|m4a|flac|aac|ogg|wma)(\?.*)?$/;
    
    return audioRegex.test(url);
  };

  React.useEffect(() => {
    // 加载历史记录
    const saved = localStorage.getItem('videoUrlHistory');
    if (saved) {
      try {
        setUrlHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load URL history:', error);
      }
    }
  }, []);

  return (
    <div>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{}}
      >
        <Form.Item
          name="url"
          label={<span style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 500, color: 'var(--text-primary)' }}>音频文件URL</span>}
          rules={[
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.resolve(); // URL不是必填的
                }
                if (validateUrl(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('请输入有效的音频文件URL'));
              }
            }
          ]}
        >
          <TextArea
            placeholder="仅支持直接音频文件链接，不支持视频平台&#10;支持的格式：&#10;• MP3: https://example.com/audio.mp3&#10;• WAV: https://example.com/audio.wav&#10;• M4A: https://example.com/audio.m4a&#10;• FLAC: https://example.com/audio.flac&#10;• OGG: https://example.com/audio.ogg&#10;• AAC: https://example.com/audio.aac&#10;• WMA: https://example.com/audio.wma"
            rows={3}
            disabled={disabled}
            onChange={handleUrlChange}
            style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              resize: 'none',
              background: 'var(--surface-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </Form.Item>

  
        </Form>

      {/* 历史记录 */}
      {urlHistory.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px' 
          }}>
            <Text style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--text-secondary)' }}>最近使用</Text>
            <Button
              type="text"
              size="small"
              onClick={clearHistory}
              icon={<DeleteOutlined />}
              style={{
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                color: 'var(--text-secondary)',
                padding: '4px 8px'
              }}
            >
              清空
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {urlHistory.map((url, index) => (
              <div
                key={index}
                style={{
                  padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                  background: 'var(--surface-secondary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid var(--border-color)'
                }}
                onClick={() => handleQuickSubmit(url)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-primary)';
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <Text 
                  ellipsis={{ tooltip: url }}
                  style={{ 
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {url}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 支持的音频格式 */}
      <div className="platform-tag" style={{
        background: 'var(--surface-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          支持的音频格式
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          <div style={{ marginBottom: '4px' }}>• <strong>MP3</strong>: 最常用的音频格式</div>
          <div style={{ marginBottom: '4px' }}>• <strong>WAV</strong>: 无损音频格式</div>
          <div style={{ marginBottom: '4px' }}>• <strong>M4A</strong>: Apple 音频格式</div>
          <div style={{ marginBottom: '4px' }}>• <strong>FLAC</strong>: 无损压缩音频</div>
          <div style={{ marginBottom: '4px' }}>• <strong>OGG</strong>: 开源音频格式</div>
          <div style={{ marginBottom: '4px' }}>• <strong>AAC</strong>: 高级音频编码</div>
          <div>• <strong>WMA</strong>: Windows Media Audio</div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--error-color)', marginTop: '12px' }}>
          ⚠️ 仅支持直接音频文件链接，不支持 YouTube、Bilibili 等视频平台
        </div>
      </div>
    </div>
  );
};

export default VideoUrlInput;