/**
 * Wan 2.5 Plugin
 * Alibaba Wan 2.5 video generation API plugin
 */

import type { Plugin, PluginContext } from "../../core/types";
import type {
  Wan25API,
  TextToVideoOptions,
  ImageToVideoOptions,
  TaskResponse,
  TaskRecord,
  VideoResult,
} from "./api";
import {
  validateTextToVideoOptions,
  validateImageToVideoOptions,
  validateTaskId,
} from "./validators";

/**
 * Model identifiers
 */
const MODEL_IDS = {
  TEXT_TO_VIDEO: "wan/2-5-text-to-video",
  IMAGE_TO_VIDEO: "wan/2-5-image-to-video",
} as const;

/**
 * Wan 2.5 Plugin definition
 */
export const Wan25Plugin: Plugin<Wan25API> = {
  name: "wan-2-5",
  version: "1.0.0",

  meta: {
    name: "wan-2-5",
    version: "1.0.0",
    description: "Alibaba Wan 2.5 video generation plugin",
    author: "KieAI",
    docs: "https://kie.ai/wan-2-5",
  },

  onInit: (ctx: PluginContext) => {
    // Check configuration
    if (!ctx.config.apiKey) {
      throw new Error("Wan 2.5 plugin requires API key");
    }

    // Log initialization if logger is available
    ctx.config.logger?.info?.("Wan 2.5 plugin initialized");
  },

  factory: (ctx: PluginContext) => {
    const { client } = ctx;
    const baseURL = "/api/v1/jobs";

    return {
      /**
       * Generate video from text
       */
      async textToVideo(options: TextToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateTextToVideoOptions(options);

        // Prepare request payload
        const payload = {
          model: MODEL_IDS.TEXT_TO_VIDEO,
          input: options,
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

        // Prepare request payload
        const payload = {
          model: MODEL_IDS.IMAGE_TO_VIDEO,
          input: options,
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
export type { Wan25API } from "./api";
export * from "./api";
