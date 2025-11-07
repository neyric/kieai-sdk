/**
 * Hailuo 2.3 Plugin
 * Hailuo Image-to-Video generation API plugin
 */

import type { Plugin, PluginContext } from '../../core/types';
import type {
  Hailuo23API,
  ImageToVideoOptions,
  TaskResponse,
  TaskRecord,
  ModelMode,
  VideoResult,
} from './api';
import { validateImageToVideoOptions, validateTaskId } from './validators';

/**
 * Model identifiers based on mode
 */
const MODEL_MAPPING = {
  pro: 'hailuo/2-3-image-to-video-pro',
  standard: 'hailuo/2-3-image-to-video-standard',
} as const;

/**
 * Get model identifier based on mode
 */
function getModelId(mode: ModelMode = 'pro'): string {
  return MODEL_MAPPING[mode];
}

/**
 * Hailuo 2.3 Plugin definition
 */
export const Hailuo23Plugin: Plugin<Hailuo23API> = {
  name: 'hailuo-2-3',
  version: '1.0.0',

  meta: {
    name: 'hailuo-2-3',
    version: '1.0.0',
    description: 'Hailuo 2.3 Image-to-Video generation plugin',
    author: 'KieAI',
    docs: 'https://docs.kie.ai/plugins/hailuo-2-3',
  },

  onInit: (ctx: PluginContext) => {
    // Check configuration
    if (!ctx.config.apiKey) {
      throw new Error('Hailuo 2.3 plugin requires API key');
    }

    // Log initialization
    ctx.config.logger?.info?.('Hailuo 2.3 plugin initialized');
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
        const model = getModelId(mode);

        // Prepare request payload (remove mode from input)
        const { mode: _, ...inputOptions } = options;
        const { callBackUrl, ...input } = inputOptions;

        const payload: Record<string, any> = {
          model,
          input,
        };

        // Add callBackUrl if provided
        if (callBackUrl) {
          payload.callBackUrl = callBackUrl;
        }

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

        // Parse resultJson if available
        let result: VideoResult | null = null;
        if (response.resultJson) {
          try {
            result = JSON.parse(response.resultJson);
          } catch {
            result = null;
          }
        }

        // Return formatted task record
        return {
          taskId: response.taskId,
          model: response.model,
          state: response.state as TaskRecord['state'],
          param: response.param,
          resultJson: response.resultJson,
          result,
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
export type { Hailuo23API } from './api';
export * from './api';
