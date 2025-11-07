/**
 * Midjourney 插件
 */

import type { Plugin, PluginContext } from '../../core/types';
import type {
  MidjourneyAPI,
  TextToImageOptions,
  ImageToImageOptions,
  UpscaleOptions,
  VaryOptions,
  GenerateResponse,
  TaskDetails,
} from './api';
import {
  validateTextToImageOptions,
  validateImageToImageOptions,
  validateUpscaleOptions,
  validateVaryOptions,
  validateTaskId,
} from './validators';

/**
 * Midjourney 插件实例
 */
export const MidjourneyPlugin: Plugin<MidjourneyAPI> = {
  name: 'midjourney',
  version: '1.0.0',

  meta: {
    name: 'midjourney',
    version: '1.0.0',
    description: 'Midjourney image generation plugin',
    author: 'KieAI',
    docs: 'https://docs.kie.ai/midjourney',
  },

  factory: (ctx: PluginContext) => {
    const { client, config } = ctx;
    const baseURL = '/api/v1/mj';

    return {
      /**
       * 文本生成图片
       */
      async generateTextToImage(
        options: TextToImageOptions
      ): Promise<GenerateResponse> {
        validateTextToImageOptions(options);

        return client.post<GenerateResponse>(`${baseURL}/generate`, {
          taskType: 'mj_txt2img',
          ...options,
          fileUrls: undefined,
        });
      },

      /**
       * 图片生成图片
       */
      async generateImageToImage(
        options: ImageToImageOptions
      ): Promise<GenerateResponse> {
        validateImageToImageOptions(options);

        return client.post<GenerateResponse>(`${baseURL}/generate`, {
          taskType: 'mj_img2img',
          ...options,
        });
      },

      /**
       * 图片放大
       */
      async upscale(options: UpscaleOptions): Promise<GenerateResponse> {
        validateUpscaleOptions(options);

        return client.post<GenerateResponse>(
          `${baseURL}/generateUpscale`,
          options
        );
      },

      /**
       * 图片变体
       */
      async vary(options: VaryOptions): Promise<GenerateResponse> {
        validateVaryOptions(options);

        return client.post<GenerateResponse>(`${baseURL}/generateVary`, options);
      },

      /**
       * 查询任务详情
       */
      async getTaskDetails(taskId: string): Promise<TaskDetails> {
        validateTaskId(taskId);

        return client.get<TaskDetails>(`${baseURL}/record-info`, {
          params: { taskId },
        });
      },
    };
  },

  onInit: (ctx: PluginContext) => {
    // 检查配置
    if (!ctx.config.apiKey) {
      throw new Error('Midjourney plugin requires API key');
    }

    // 可以在这里添加日志
    ctx.config.logger?.info?.('Midjourney plugin initialized');
  },

  onDispose: () => {
    // 清理资源（如果需要）
  },
};

// 导出类型
export type { MidjourneyAPI } from './api';
export * from './api';
