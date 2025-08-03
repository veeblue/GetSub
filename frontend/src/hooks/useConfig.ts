import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getConfig,
  saveConfig,
  updateConfig,
  getConfigStatus
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

  return {
    config: config?.config,
    configStatus,
    isLoading,
    error,
    saveConfig: saveConfigMutation.mutate,
    updateConfig: updateConfigMutation.mutate,
    isSaving: saveConfigMutation.isPending || updateConfigMutation.isPending,
  };
};