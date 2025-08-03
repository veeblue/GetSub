import React, { useState, useCallback } from 'react';
import {
  Card,
  Tabs,
  Input,
  Button,
  Alert,
  Space,
  Typography,
  Row,
  Col,
  message,
  Divider
} from 'antd';
import {
  FileTextOutlined,
  TranslationOutlined,
  EditOutlined,
  SaveOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { parseSRT, generateSRT, downloadFile } from '../utils/helpers';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface SubtitlePreviewProps {
  originalSrt?: string;
  translatedSrt?: string;
  onEdit?: (originalSrt?: string, translatedSrt?: string) => void;
  showDownload?: boolean;
}

const SubtitlePreview: React.FC<SubtitlePreviewProps> = ({
  originalSrt,
  translatedSrt,
  onEdit,
  showDownload = true
}) => {
  const [activeTab, setActiveTab] = useState('original');
  const [editingOriginal, setEditingOriginal] = useState(false);
  const [editingTranslated, setEditingTranslated] = useState(false);
  const [editedOriginal, setEditedOriginal] = useState(originalSrt || '');
  const [editedTranslated, setEditedTranslated] = useState(translatedSrt || '');
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const validateSRT = (content: string): boolean => {
    try {
      const segments = parseSRT(content);
      return segments.length > 0;
    } catch {
      return false;
    }
  };

  const handleSaveOriginal = useCallback(() => {
    if (!validateSRT(editedOriginal)) {
      setSaveStatus({
        type: 'error',
        message: '原始字幕格式不正确，请检查 SRT 格式'
      });
      return;
    }

    setSaveStatus({
      type: 'success',
      message: '原始字幕保存成功'
    });

    if (onEdit) {
      onEdit(editedOriginal, translatedSrt);
    }

    setEditingOriginal(false);
    
    // 3秒后清除状态
    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
  }, [editedOriginal, translatedSrt, onEdit]);

  const handleSaveTranslated = useCallback(() => {
    if (!validateSRT(editedTranslated)) {
      setSaveStatus({
        type: 'error',
        message: '翻译字幕格式不正确，请检查 SRT 格式'
      });
      return;
    }

    setSaveStatus({
      type: 'success',
      message: '翻译字幕保存成功'
    });

    if (onEdit) {
      onEdit(originalSrt, editedTranslated);
    }

    setEditingTranslated(false);
    
    // 3秒后清除状态
    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
  }, [editedTranslated, originalSrt, onEdit]);

  const handleDownloadOriginal = useCallback(() => {
    if (editedOriginal) {
      downloadFile(editedOriginal, 'original_subtitles.srt', 'text/srt');
    }
  }, [editedOriginal]);

  const handleDownloadTranslated = useCallback(() => {
    if (editedTranslated) {
      downloadFile(editedTranslated, 'translated_subtitles.srt', 'text/srt');
    }
  }, [editedTranslated]);

  const handleCancelEditOriginal = useCallback(() => {
    setEditedOriginal(originalSrt || '');
    setEditingOriginal(false);
  }, [originalSrt]);

  const handleCancelEditTranslated = useCallback(() => {
    setEditedTranslated(translatedSrt || '');
    setEditingTranslated(false);
  }, [translatedSrt]);

  React.useEffect(() => {
    setEditedOriginal(originalSrt || '');
    setEditedTranslated(translatedSrt || '');
  }, [originalSrt, translatedSrt]);

  if (!originalSrt && !translatedSrt) {
    return (
      <Card title="📝 字幕预览和编辑" style={{ marginBottom: 24 }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">
            字幕内容将在这里显示，请先生成字幕
          </Text>
        </div>
      </Card>
    );
  }

  const originalSegments = originalSrt ? parseSRT(originalSrt) : [];
  const translatedSegments = translatedSrt ? parseSRT(translatedSrt) : [];

  return (
    <Card 
      title="📝 字幕预览和编辑" 
      style={{ marginBottom: 24 }}
      extra={
        showDownload && (
          <Space>
            {originalSrt && (
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadOriginal}
                size="small"
              >
                下载原始
              </Button>
            )}
            {translatedSrt && (
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTranslated}
                size="small"
              >
                下载翻译
              </Button>
            )}
          </Space>
        )
      }
    >
      {saveStatus.type && (
        <Alert
          message={saveStatus.message}
          type={saveStatus.type}
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'original',
            label: (
              <Space>
                <FileTextOutlined />
                原始字幕
                {originalSegments.length > 0 && (
                  <Text type="secondary">({originalSegments.length} 条)</Text>
                )}
              </Space>
            ),
            children: (
              <div>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                  <Col>
                    <Text type="secondary">
                      {originalSegments.length > 0 && (
                        <span>共 {originalSegments.length} 条字幕</span>
                      )}
                    </Text>
                  </Col>
                  <Col>
                    {editingOriginal ? (
                      <Space>
                        <Button size="small" onClick={handleCancelEditOriginal}>
                          取消
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          icon={<SaveOutlined />}
                          onClick={handleSaveOriginal}
                        >
                          保存
                        </Button>
                      </Space>
                    ) : (
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setEditingOriginal(true)}
                      >
                        编辑
                      </Button>
                    )}
                  </Col>
                </Row>
                
                {editingOriginal ? (
                  <TextArea
                    value={editedOriginal}
                    onChange={(e) => setEditedOriginal(e.target.value)}
                    rows={15}
                    placeholder="请输入 SRT 格式的字幕内容..."
                    style={{ fontFamily: 'monospace' }}
                  />
                ) : (
                  <div
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '12px',
                      backgroundColor: 'var(--surface-secondary)',
                      maxHeight: '400px',
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {editedOriginal.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'translated',
            label: (
              <Space>
                <TranslationOutlined />
                翻译字幕
                {translatedSegments.length > 0 && (
                  <Text type="secondary">({translatedSegments.length} 条)</Text>
                )}
              </Space>
            ),
            disabled: !translatedSrt,
            children: (
              <div>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                  <Col>
                    <Text type="secondary">
                      {translatedSegments.length > 0 && (
                        <span>共 {translatedSegments.length} 条字幕</span>
                      )}
                    </Text>
                  </Col>
                  <Col>
                    {editingTranslated ? (
                      <Space>
                        <Button size="small" onClick={handleCancelEditTranslated}>
                          取消
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          icon={<SaveOutlined />}
                          onClick={handleSaveTranslated}
                        >
                          保存
                        </Button>
                      </Space>
                    ) : (
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setEditingTranslated(true)}
                      >
                        编辑
                      </Button>
                    )}
                  </Col>
                </Row>
                
                {editingTranslated ? (
                  <TextArea
                    value={editedTranslated}
                    onChange={(e) => setEditedTranslated(e.target.value)}
                    rows={15}
                    placeholder="请输入 SRT 格式的字幕内容..."
                    style={{ fontFamily: 'monospace' }}
                  />
                ) : (
                  <div
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '12px',
                      backgroundColor: 'var(--surface-secondary)',
                      maxHeight: '400px',
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {editedTranslated.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      </Card>
  );
};

export default SubtitlePreview;