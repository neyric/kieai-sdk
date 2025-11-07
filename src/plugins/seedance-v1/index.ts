/**
 * SeeDance V1 Plugin
 * ByteDance SeeDance video generation API plugin
 */

import type { Plugin, PluginContext } from '../../core/types';
import type {
  SeeDanceV1API,
  ImageToVideoOptions,
  TextToVideoOptions,
  TaskResponse,
  TaskRecord,
  ModelMode,
  VideoResult,
} from './api';
import {
  validateImageToVideoOptions,
  validateTextToVideoOptions,
  validateTaskId,
} from './validators';

/**
 * Model identifiers based on mode
 */
const MODEL_MAPPING = {
  i2v: {
    pro: 'bytedance/v1-pro-image-to-video',
    lite: 'bytedance/v1-lite-image-to-video',
  },
  t2v: {
    pro: 'bytedance/v1-pro-text-to-video',
    lite: 'bytedance/v1-lite-text-to-video',
  },
} as const;

/**
 * Get model identifier based on type and mode
 */
function getModelId(type: 'i2v' | 't2v', mode: ModelMode = 'pro'): string {
  return MODEL_MAPPING[type][mode];
}

/**
 * SeeDance V1 Plugin definition
 */
export const SeeDanceV1Plugin: Plugin<SeeDanceV1API> = {
  name: 'seedance-v1',
  version: '1.0.0',

  meta: {
    name: 'seedance-v1',
    version: '1.0.0',
    description: 'ByteDance SeeDance video generation plugin',
    author: 'KieAI',
    docs: 'https://docs.kie.ai/plugins/seedance-v1',
  },

  onInit: (ctx: PluginContext) => {
    // 检查配置
    if (!ctx.config.apiKey) {
      throw new Error('SeeDance V1 plugin requires API key');
    }

    // 可以在这里添加日志
    ctx.config.logger?.info?.('SeeDance V1 plugin initialized');
  },

  factory: (ctx: PluginContext) => {
    const { client } = ctx;
    const baseURL = '/api/v1/jobs';

    return {
      /**
       * Generate video from image
       */
      async imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateImageToVideoOptions(options);

        // Determine model based on mode
        const mode = options.mode || 'pro';
        const model = getModelId('i2v', mode);

        // Prepare request payload
        const { mode: _, ...optionsWithoutMode } = options;
        const payload = {
          model,
          input: optionsWithoutMode,
          callbackUrl: options.callBackUrl,
        };

        // Make HTTP request
        return client.post<TaskResponse>(`${baseURL}/createTask`, payload);
      },

      /**
       * Generate video from text
       */
      async textToVideo(options: TextToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateTextToVideoOptions(options);

        // Determine model based on mode
        const mode = options.mode || 'pro';
        const model = getModelId('t2v', mode);

        // Prepare request payload
        const { mode: _, ...optionsWithoutMode } = options;
        const payload = {
          model,
          input: optionsWithoutMode,
          callbackUrl: options.callBackUrl,
        };

        // Make HTTP request
        return client.post<TaskResponse>(`${baseURL}/createTask`, payload);
      },

      /**
       * Get task record by ID
       */
      async getTaskRecord(taskId: string): Promise<TaskRecord> {
        // Validate task ID
        validateTaskId(taskId);

        // Make HTTP request
        const response = await client.get<{
          taskId: string;
          model: string;
          state: string;
          param: string;
          resultJson: string | null;
          failCode: number | null;
          failMsg: string | null;
          completeTime: number | null;
          createTime: number;
          updateTime: number;
        }>(`${baseURL}/recordInfo`, {
          params: { taskId },
        });

        // Parse JSON fields
        let param: Record<string, any>;
        let result: VideoResult | null;

        try {
          param = JSON.parse(response.param);
        } catch {
          param = {};
        }

        try {
          if (response.resultJson) {
            result = JSON.parse(response.resultJson);
          } else {
            result = null;
          }
        } catch {
          result = null;
        }

        // Return formatted task record
        return {
          taskId: response.taskId,
          model: response.model,
          state: response.state as TaskRecord['state'],
          param,
          result,
          resultJson: response.resultJson,
          failCode: response.failCode,
          failMsg: response.failMsg,
          completeTime: response.completeTime,
          createTime: response.createTime,
          updateTime: response.updateTime,
        };
      },
    };
  },

  onDispose: () => {
    // Cleanup resources if needed
  },
};

// 导出类型
export type { SeeDanceV1API } from './api';
export * from './api';
