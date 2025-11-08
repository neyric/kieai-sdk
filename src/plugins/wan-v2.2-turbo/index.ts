/**
 * Wan 2.2 Turbo Plugin
 * Wan 2.2 A14b video generation API (Turbo models)
 */

import type { Plugin, PluginContext } from "../../core/types";
import type {
  WanV22TurboAPI,
  ImageToVideoOptions,
  TextToVideoOptions,
  TaskResponse,
  TaskRecord,
  VideoResult,
} from "./api";
import {
  validateImageToVideoOptions,
  validateTextToVideoOptions,
  validateTaskId,
} from "./validators";

/**
 * Model identifiers
 */
const MODELS = {
  imageToVideo: "wan/2-2-a14b-image-to-video-turbo",
  textToVideo: "wan/2-2-a14b-text-to-video-turbo",
} as const;

/**
 * Wan 2.2 Turbo Plugin definition
 */
export const WanV22TurboPlugin: Plugin<WanV22TurboAPI> = {
  name: "wan-v2.2-turbo",
  version: "1.0.0",

  meta: {
    name: "wan-v2.2-turbo",
    version: "1.0.0",
    description: "Wan 2.2 A14b Turbo video generation plugin",
    author: "KieAI",
    docs: "https://kie.ai/wan/v2-2",
  },

  onInit: (ctx: PluginContext) => {
    // Check configuration
    if (!ctx.config.apiKey) {
      throw new Error("Wan V2 Turbo plugin requires API key");
    }

    // Optional logging
    ctx.config.logger?.info?.("Wan V2 Turbo plugin initialized");
  },

  factory: (ctx: PluginContext) => {
    const { client } = ctx;
    const baseURL = "/api/v1/jobs";

    return {
      /**
       * Generate video from image using Turbo model
       */
      async imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateImageToVideoOptions(options);

        // Prepare request payload
        const { callBackUrl, ...input } = options;
        const payload = {
          model: MODELS.imageToVideo,
          input,
          ...(callBackUrl && { callBackUrl }),
        };

        // Make HTTP request
        return client.post<TaskResponse>(`${baseURL}/createTask`, payload);
      },

      /**
       * Generate video from text using Turbo model
       */
      async textToVideo(options: TextToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateTextToVideoOptions(options);

        // Prepare request payload
        const { callBackUrl, ...input } = options;
        const payload = {
          model: MODELS.textToVideo,
          input,
          ...(callBackUrl && { callBackUrl }),
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
          state: response.state as TaskRecord["state"],
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
export type { WanV22TurboAPI } from "./api";
export * from "./api";
