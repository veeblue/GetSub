import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { uploadFile, generateSubtitles, processUrl as processUrlApi } from '../services/api';
import { ProcessingStatus, FileUploadResponse, SubtitleResponse, SubtitleRequest } from '../types';

export const useSubtitleProcessing = () => {
  const queryClient = useQueryClient();
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    message: '',
  });

  // 上传文件
  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onMutate: () => {
      setProcessingStatus({
        status: 'uploading',
        message: '正在上传文件...',
        progress: 0,
      });
    },
    onSuccess: (data: FileUploadResponse) => {
      if (data.success) {
        setProcessingStatus({
          status: 'idle',
          message: '文件上传成功',
        });
        message.success('文件上传成功');
        return data.file_id;
      } else {
        setProcessingStatus({
          status: 'error',
          message: data.message || '文件上传失败',
        });
        message.error(data.message || '文件上传失败');
        throw new Error(data.message);
      }
    },
    onError: (error: any) => {
      setProcessingStatus({
        status: 'error',
        message: error.response?.data?.message || '文件上传失败',
      });
      message.error(error.response?.data?.message || '文件上传失败');
    },
  });

  // 生成字幕
  const generateSubtitlesMutation = useMutation({
    mutationFn: ({ file_id, request }: { file_id: string; request: SubtitleRequest }) =>
      generateSubtitles(file_id, request),
    onMutate: () => {
      setProcessingStatus({
        status: 'processing',
        message: '正在生成字幕...',
        progress: 0,
      });
    },
    onSuccess: (data: SubtitleResponse) => {
      if (data.success) {
        setProcessingStatus({
          status: 'completed',
          message: '字幕生成完成',
        });
        message.success('字幕生成完成');
        return data;
      } else {
        setProcessingStatus({
          status: 'error',
          message: data.message || '字幕生成失败',
        });
        message.error(data.message || '字幕生成失败');
        throw new Error(data.message);
      }
    },
    onError: (error: any) => {
      setProcessingStatus({
        status: 'error',
        message: error.response?.data?.message || '字幕生成失败',
      });
      message.error(error.response?.data?.message || '字幕生成失败');
    },
    onSettled: () => {
      // 模拟进度更新
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 90) progress = 90;
        
        setProcessingStatus(prev => 
          prev.status === 'processing' 
            ? { ...prev, progress }
            : prev
        );
        
        if (progress >= 90) {
          clearInterval(interval);
        }
      }, 500);
    },
  });

  // 处理URL
  const processUrlMutation = useMutation({
    mutationFn: ({ url, request }: { url: string; request: SubtitleRequest }) =>
      processUrlApi(url, request),
    onMutate: () => {
      setProcessingStatus({
        status: 'processing',
        message: '正在处理在线音视频...',
        progress: 0,
      });
    },
    onSuccess: (data: SubtitleResponse) => {
      if (data.success) {
        setProcessingStatus({
          status: 'completed',
          message: '字幕生成完成',
        });
        message.success('字幕生成完成');
        return data;
      } else {
        setProcessingStatus({
          status: 'error',
          message: data.message || '处理失败',
        });
        message.error(data.message || '处理失败');
        throw new Error(data.message);
      }
    },
    onError: (error: any) => {
      setProcessingStatus({
        status: 'error',
        message: error.response?.data?.message || '处理失败',
      });
      message.error(error.response?.data?.message || '处理失败');
    },
    onSettled: () => {
      // 模拟进度更新
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 90) progress = 90;
        
        setProcessingStatus(prev => 
          prev.status === 'processing' 
            ? { ...prev, progress }
            : prev
        );
        
        if (progress >= 90) {
          clearInterval(interval);
        }
      }, 500);
    },
  });

  // 处理文件上传和字幕生成
  const processFile = useCallback(async (
    file: File,
    request: SubtitleRequest
  ) => {
    try {
      // 上传文件
      const fileId = await uploadFileMutation.mutateAsync(file);
      
      // 生成字幕
      const result = await generateSubtitlesMutation.mutateAsync({
        file_id: fileId.file_id!,
        request,
      });
      
      return result;
    } catch (error) {
      console.error('Processing failed:', error);
      throw error;
    }
  }, [uploadFileMutation, generateSubtitlesMutation]);

  // 处理URL字幕生成
  const processUrl = useCallback(async (
    url: string,
    request: SubtitleRequest
  ) => {
    try {
      const result = await processUrlMutation.mutateAsync({
        url,
        request,
      });
      
      return result;
    } catch (error) {
      console.error('URL processing failed:', error);
      throw error;
    }
  }, [processUrlMutation]);

  // 重置状态
  const resetStatus = useCallback(() => {
    setProcessingStatus({
      status: 'idle',
      message: '',
    });
  }, []);

  return {
    processingStatus,
    processFile,
    processUrl,
    resetStatus,
    isUploading: uploadFileMutation.isPending,
    isProcessing: generateSubtitlesMutation.isPending || processUrlMutation.isPending,
    isLoading: uploadFileMutation.isPending || generateSubtitlesMutation.isPending || processUrlMutation.isPending,
  };
};