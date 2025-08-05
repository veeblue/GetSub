import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getConfig,
  saveConfig,
  updateConfig,
  getConfigStatus,
  validateConfig,
  useEnvironmentConfig
} from '../services/api';
import { APIConfig, APIConfigResponse } from '../types';

export const useConfig = () => {
  const queryClient = useQueryClient();
  
  // 获取配置
  const { data: config, isLoading, error } = useQuery<APIConfigResponse>({
    queryKey: ['config'],
    queryFn: getConfig,
    retry: false,
  });

  // 获取配置状态
  const { data: configStatus } = useQuery({
    queryKey: ['config-status'],
    queryFn: getConfigStatus,
    retry: false,
  });

  // 验证配置
  const { data: configValidation, refetch: validateConfigRefetch } = useQuery({
    queryKey: ['config-validation'],
    queryFn: validateConfig,
    retry: false,
    enabled: false, // 手动触发
  });

  // 保存配置
  const saveConfigMutation = useMutation({
    mutationFn: saveConfig,
    onSuccess: (data: APIConfigResponse) => {
      if (data.success) {
        message.success('配置保存成功');
        queryClient.invalidateQueries({ queryKey: ['config'] });
        queryClient.invalidateQueries({ queryKey: ['config-status'] });
      } else {
        message.error(data.message || '配置保存失败');
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '配置保存失败');
    },
  });

  // 更新配置
  const updateConfigMutation = useMutation({
    mutationFn: updateConfig,
    onSuccess: (data: APIConfigResponse) => {
      if (data.success) {
        message.success('配置更新成功');
        queryClient.invalidateQueries({ queryKey: ['config'] });
        queryClient.invalidateQueries({ queryKey: ['config-status'] });
      } else {
        message.error(data.message || '配置更新失败');
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '配置更新失败');
    },
  });

  // 使用环境配置
  const useEnvironmentConfigMutation = useMutation({
    mutationFn: useEnvironmentConfig,
    onSuccess: (data: any) => {
      if (data.success) {
        message.success('已切换到环境变量配置');
        queryClient.invalidateQueries({ queryKey: ['config'] });
        queryClient.invalidateQueries({ queryKey: ['config-status'] });
      } else {
        message.error(data.message || '切换到环境配置失败');
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '切换到环境配置失败');
    },
  });

  return {
    config: config?.config,
    configStatus,
    configValidation,
    isLoading,
    error,
    saveConfig: saveConfigMutation.mutate,
    updateConfig: updateConfigMutation.mutate,
    validateConfig: validateConfigRefetch,
    useEnvironmentConfig: useEnvironmentConfigMutation.mutate,
    isSaving: saveConfigMutation.isPending || updateConfigMutation.isPending || useEnvironmentConfigMutation.isPending,
  };
};