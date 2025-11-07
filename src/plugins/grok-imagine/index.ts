/**
 * Grok Imagine Plugin
 * Grok image and video generation API plugin
 */

import type { Plugin, PluginContext } from '../../core/types';
import type {
  GrokImagineAPI,
  TextToVideoOptions,
  ImageToVideoOptions,
  UpscaleOptions,
  TaskResponse,
  TaskRecord,
  MediaResult,
} from './api';
import {
  validateTextToVideoOptions,
  validateImageToVideoOptions,
  validateUpscaleOptions,
  validateTaskId,
} from './validators';

/**
 * Model identifiers
 */
const MODEL_IDS = {
  textToVideo: 'grok-imagine/text-to-video',
  imageToVideo: 'grok-imagine/image-to-video',
  upscale: 'grok-imagine/upscale',
} as const;

/**
 * Grok Imagine Plugin definition
 */
export const GrokImaginePlugin: Plugin<GrokImagineAPI> = {
  name: 'grok-imagine',
  version: '1.0.0',

  meta: {
    name: 'grok-imagine',
    version: '1.0.0',
    description: 'Grok image and video generation plugin',
    author: 'KieAI',
    docs: 'https://docs.kie.ai/plugins/grok-imagine',
  },

  onInit: (ctx: PluginContext) => {
    // Check configuration
    if (!ctx.config.apiKey) {
      throw new Error('Grok Imagine plugin requires API key');
    }

    // Log initialization
    ctx.config.logger?.info?.('Grok Imagine plugin initialized');
  },

  factory: (ctx: PluginContext) => {
    const { client } = ctx;
    const baseURL = '/api/v1/jobs';

    return {
      /**
       * Generate video from text prompt
       */
      async textToVideo(options: TextToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateTextToVideoOptions(options);

        // Prepare request payload
        const payload = {
          model: MODEL_IDS.textToVideo,
          input: {
            prompt: options.prompt,
            aspect_ratio: options.aspect_ratio,
            mode: options.mode,
          },
          callBackUrl: options.callBackUrl,
        };

        // Make HTTP request
        return client.post<TaskResponse>(`${baseURL}/createTask`, payload);
      },

      /**
       * Generate video from image
       */
      async imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateImageToVideoOptions(options);

        // Prepare input based on whether using image_urls or task_id
        const input: Record<string, any> = {
          prompt: options.prompt,
          mode: options.mode,
        };

        if (options.image_urls) {
          input.image_urls = options.image_urls;
        } else if (options.task_id) {
          input.task_id = options.task_id;
          input.index = options.index ?? 0;
        }

        // Prepare request payload
        const payload = {
          model: MODEL_IDS.imageToVideo,
          input,
          callBackUrl: options.callBackUrl,
        };

        // Make HTTP request
        return client.post<TaskResponse>(`${baseURL}/createTask`, payload);
      },

      /**
       * Upscale generated content
       */
      async upscale(options: UpscaleOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateUpscaleOptions(options);

        // Prepare request payload
        const payload = {
          model: MODEL_IDS.upscale,
          input: {
            task_id: options.task_id,
          },
          callBackUrl: options.callBackUrl,
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
          failCode: string | null;
          failMsg: string | null;
          costTime: number | null;
          completeTime: number | null;
          createTime: number;
        }>(`${baseURL}/recordInfo`, {
          params: { taskId },
        });

        // Parse JSON fields
        let param: Record<string, any>;
        let result: MediaResult | null;

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
          costTime: response.costTime,
          completeTime: response.completeTime,
          createTime: response.createTime,
        };
      },
    };
  },

  onDispose: () => {
    // Cleanup resources if needed
  },
};

// Export types
export type { GrokImagineAPI } from './api';
export * from './api';
