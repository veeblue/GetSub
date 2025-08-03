import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Slider,
  Button,
  Tabs,
  Alert,
  Space,
  Typography,
  Card,
  Divider,
  message
} from 'antd';
import { SettingOutlined, ApiOutlined, TranslationOutlined } from '@ant-design/icons';
import { useConfig } from '../hooks/useConfig';
import { APIConfig } from '../types';

const { Title } = Typography;
const { Option } = Select;

interface ConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ visible, onClose }) => {
  const { config, configStatus, saveConfig, isSaving } = useConfig();
  const [form] = Form.useForm<APIConfig>();
  const [activeTab, setActiveTab] = useState('asr');

  // 根据提供商更新默认API URL
  const handleProviderChange = (provider: string) => {
    const defaultUrls = {
      'DeepSeek': 'https://api.deepseek.com/v1',
      'OpenAI': 'https://api.openai.com/v1',
      'Qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      'Anthropic': 'https://api.anthropic.com/v1',
      'Azure OpenAI': 'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
      '自定义': ''
    };
    
    form.setFieldsValue({
      translation_base_url: defaultUrls[provider as keyof typeof defaultUrls] || ''
    });
  };

  const handleSave = (values: APIConfig) => {
    saveConfig(values);
    // 错误处理已经在 useConfig hook 中处理
    onClose();
  };

  React.useEffect(() => {
    if (config && visible) {
      form.setFieldsValue(config);
    }
  }, [config, visible, form]);

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span style={{ color: 'var(--text-primary)' }}>API 配置</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{
        '--ant-modal-header-bg': 'var(--surface-primary)',
        '--ant-modal-content-bg': 'var(--surface-primary)',
        '--ant-modal-footer-bg': 'var(--surface-primary)',
        '--ant-modal-border-radius': '16px',
      } as React.CSSProperties}
      className="config-modal"
    >
      {!configStatus?.configured && (
        <Alert
          message="API 未配置"
          description="请先配置语音识别和翻译服务的 API 密钥，否则无法使用字幕生成功能。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        requiredMark={false}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'asr',
              label: (
                <Space>
                  <ApiOutlined />
                  语音识别配置
                </Space>
              ),
              children: (
                <Card size="small">
                  <Title level={5}>字节跳动语音识别设置</Title>
                  
                  <Form.Item
                    name="asr_provider"
                    label="语音识别提供商"
                    rules={[{ required: true, message: '请选择语音识别提供商' }]}
                    initialValue="ByteDance"
                  >
                    <Select>
                      <Option value="ByteDance">字节跳动</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="asr_appid"
                    label="AppID"
                    rules={[{ required: true, message: '请输入 AppID' }]}
                  >
                    <Input placeholder="请输入字节跳动 AppID" />
                  </Form.Item>
                  
                  <Form.Item
                    name="asr_access_token"
                    label="Access Token"
                    rules={[{ required: true, message: '请输入 Access Token' }]}
                  >
                    <Input.Password placeholder="请输入字节跳动 Access Token" />
                  </Form.Item>
                  
                  <Form.Item
                    name="asr_base_url"
                    label="API URL"
                    rules={[{ required: true, message: '请输入 API URL' }]}
                  >
                    <Input placeholder="https://openspeech.bytedance.com/api/v1/vc" />
                  </Form.Item>
                  
                  <Alert
                    message="说明"
                    description="语音识别固定使用字节跳动 API，主要支持中文语音识别，支持 MP3、WAV、M4A 格式。"
                    type="info"
                    showIcon
                  />
                </Card>
              ),
            },
            {
              key: 'translation',
              label: (
                <Space>
                  <TranslationOutlined />
                  翻译配置
                </Space>
              ),
              children: (
                <Card size="small">
                  <Title level={5}>大语言模型翻译设置</Title>
                  
                  <Form.Item
                    name="translation_provider"
                    label="模型提供商"
                    rules={[{ required: true, message: '请选择模型提供商' }]}
                  >
                    <Select onChange={handleProviderChange}>
                      <Option value="DeepSeek">DeepSeek</Option>
                      <Option value="OpenAI">OpenAI</Option>
                      <Option value="Qwen">Qwen</Option>
                      <Option value="Anthropic">Anthropic</Option>
                      <Option value="Azure OpenAI">Azure OpenAI</Option>
                      <Option value="自定义">自定义</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="translation_model"
                    label="模型名称"
                    rules={[{ required: true, message: '请输入模型名称' }]}
                  >
                    <Input placeholder="deepseek-chat, gpt-4, qwen-turbo 等" />
                  </Form.Item>
                  
                  <Form.Item
                    name="translation_api_key"
                    label="API 密钥"
                    rules={[{ required: true, message: '请输入 API 密钥' }]}
                  >
                    <Input.Password placeholder="请输入您的 API 密钥" />
                  </Form.Item>
                  
                  <Form.Item
                    name="translation_base_url"
                    label="API 基础 URL"
                    rules={[{ required: true, message: '请输入 API 基础 URL' }]}
                  >
                    <Input placeholder="https://api.deepseek.com/v1" />
                  </Form.Item>
                  
                  <Divider />
                  
                  <Title level={5}>模型参数</Title>
                  
                  <Form.Item
                    name="translation_temperature"
                    label="温度"
                    tooltip="数值越高输出越随机"
                  >
                    <Slider
                      min={0.0}
                      max={2.0}
                      step={0.1}
                      marks={{
                        0: '0',
                        0.5: '0.5',
                        1.0: '1.0',
                        1.5: '1.5',
                        2.0: '2.0'
                      }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="translation_max_tokens"
                    label="最大令牌数"
                    tooltip="最大响应长度"
                  >
                    <InputNumber
                      min={100}
                      max={4000}
                      step={100}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="translation_top_p"
                    label="顶部 P 值"
                    tooltip="核心采样参数"
                  >
                    <Slider
                      min={0.0}
                      max={1.0}
                      step={0.1}
                      marks={{
                        0: '0',
                        0.5: '0.5',
                        1.0: '1.0'
                      }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="translation_frequency_penalty"
                    label="频率惩罚"
                    tooltip="惩罚重复的词汇"
                  >
                    <Slider
                      min={-2.0}
                      max={2.0}
                      step={0.1}
                      marks={{
                        '-2.0': '-2.0',
                        '-1.0': '-1.0',
                        '0': '0',
                        '1.0': '1.0',
                        '2.0': '2.0'
                      }}
                    />
                  </Form.Item>
                </Card>
              ),
            },
          ]}
        />
        
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={onClose}>
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSaving}
            >
              保存配置
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default ConfigModal;