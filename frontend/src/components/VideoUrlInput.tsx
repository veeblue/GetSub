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
    
    // 支持的音视频平台URL模式
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const bilibiliRegex = /^(https?:\/\/)?(www\.)?(bilibili\.com)\/.+/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+/;
    const videoRegex = /^(https?:\/\/).+\.(mp4|webm|ogg|avi|mov|mkv|flv)(\?.*)?$/;
    const audioRegex = /^(https?:\/\/).+\.(mp3|wav|m4a|flac|aac|ogg)(\?.*)?$/;
    
    return (
      youtubeRegex.test(url) ||
      bilibiliRegex.test(url) ||
      vimeoRegex.test(url) ||
      videoRegex.test(url) ||
      audioRegex.test(url)
    );
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
          label={<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>音视频URL</span>}
          rules={[
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.resolve(); // URL不是必填的
                }
                if (validateUrl(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('请输入有效的音视频URL'));
              }
            }
          ]}
        >
          <TextArea
            placeholder="支持 YouTube、Bilibili、Vimeo 或直接音视频文件链接&#10;例如：&#10;• https://www.youtube.com/watch?v=...&#10;• https://www.bilibili.com/video/...&#10;• https://example.com/video.mp4&#10;• https://example.com/audio.mp3"
            rows={4}
            disabled={disabled}
            onChange={handleUrlChange}
            style={{
              fontSize: '14px',
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
        <div style={{ marginTop: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px' 
          }}>
            <Text style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>最近使用</Text>
            <Button
              type="text"
              size="small"
              onClick={clearHistory}
              icon={<DeleteOutlined />}
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)'
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
                  padding: '12px 16px',
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
                    fontSize: '13px',
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

      {/* 支持的平台 */}
      <div className="platform-tag" style={{
        background: 'var(--surface-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          支持的音视频平台
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          <div style={{ marginBottom: '4px' }}>• <strong>YouTube</strong>: 所有公开视频</div>
          <div style={{ marginBottom: '4px' }}>• <strong>Bilibili</strong>: 支持大部分视频</div>
          <div style={{ marginBottom: '4px' }}>• <strong>Vimeo</strong>: 公开视频</div>
          <div style={{ marginBottom: '4px' }}>• <strong>直接视频链接</strong>: MP4, WebM, OGG, AVI, MOV, MKV, FLV</div>
          <div>• <strong>直接音频链接</strong>: MP3, WAV, M4A, FLAC, AAC, OGG</div>
        </div>
      </div>
    </div>
  );
};

export default VideoUrlInput;