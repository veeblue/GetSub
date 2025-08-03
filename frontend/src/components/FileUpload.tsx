import React, { useState, useCallback } from 'react';
import { Upload, Button, Alert, Typography } from 'antd';
import { InboxOutlined, AudioOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { validateFileType, validateFileSize, formatFileSize, isVideoFile } from '../utils/helpers';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  maxSize?: number; // in bytes
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  disabled = false,
  maxSize = 100 * 1024 * 1024, // 100MB
}) => {
  const [fileInfo, setFileInfo] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const beforeUpload = useCallback((file: File) => {
    setError('');
    
    // 验证文件类型
    if (!validateFileType(file)) {
      setError('不支持的文件格式。支持的格式：MP3, WAV, M4A, FLAC, OGG, MP4, AVI, MOV, MKV, WMV, FLV, WEBM');
      return false;
    }
    
    // 验证文件大小
    if (!validateFileSize(file, maxSize)) {
      setError(`文件大小超过限制。最大支持 ${formatFileSize(maxSize)}`);
      return false;
    }
    
    setFileInfo(file);
    onFileSelect(file);
    return false; // 阻止自动上传
  }, [maxSize, onFileSelect]);

  const handleRemove = useCallback(() => {
    setFileInfo(null);
    setError('');
  }, []);

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload,
    showUploadList: false,
    disabled,
    accept: '.mp3,.wav,.m4a,.flac,.ogg,.mp4,.avi,.mov,.mkv,.wmv,.flv,.webm',
  };

  return (
    <div>
      {error && (
        <div style={{
          background: 'var(--error-color)',
          border: '1px solid var(--error-color)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--error-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>!</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              上传错误
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {error}
            </div>
          </div>
        </div>
      )}
      
      {!fileInfo ? (
        <div style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          background: 'var(--surface-secondary)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary-color)';
          e.currentTarget.style.background = 'var(--surface-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.background = 'var(--surface-secondary)';
        }}>
          <Dragger {...uploadProps} style={{ border: 'none', background: 'transparent' }}>
            <div style={{ fontSize: '48px', color: 'var(--primary-color)', marginBottom: '16px' }}>
              <InboxOutlined />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              点击或拖拽文件到此区域上传
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              支持单个文件上传，支持拖拽上传
            </div>
          </Dragger>
        </div>
      ) : (
        <div style={{
          background: 'var(--surface-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--primary-color)' }}>
            {isVideoFile(fileInfo) ? <VideoCameraOutlined /> : <AudioOutlined />}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {fileInfo.name}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            文件大小: {formatFileSize(fileInfo.size)} • 类型: {isVideoFile(fileInfo) ? '视频' : '音频'}
          </div>
          <Button 
            onClick={handleRemove}
            style={{
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              height: 'auto',
              padding: '8px 16px'
            }}
          >
            重新选择文件
          </Button>
        </div>
      )}
      
      <div style={{ marginTop: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          支持的格式：
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            🎵 音频：MP3, WAV, M4A, FLAC, OGG
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            🎬 视频：MP4, AVI, MOV, MKV, WMV, FLV, WEBM
          </div>
        </div>
        <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          最大文件大小：{formatFileSize(maxSize)}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;