/**
 * Kling 2.5 Plugin
 * Kling AI video generation API plugin
 */

import type { Plugin, PluginContext } from "../../core/types";
import type {
  Kling25API,
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
const MODELS = {
  TEXT_TO_VIDEO: "kling/v2-5-turbo-text-to-video-pro",
  IMAGE_TO_VIDEO: "kling/v2-5-turbo-image-to-video-pro",
} as const;

/**
 * Kling 2.5 Plugin definition
 */
export const Kling25Plugin: Plugin<Kling25API> = {
  name: "kling-2-5",
  version: "1.0.0",

  meta: {
    name: "kling-2-5",
    version: "1.0.0",
    description: "Kling AI v2.5 Turbo Pro video generation plugin",
    author: "KieAI",
    docs: "https://kie.ai/kling-2-5",
  },

  onInit: (ctx: PluginContext) => {
    // Check configuration
    if (!ctx.config.apiKey) {
      throw new Error("Kling 2.5 plugin requires API key");
    }

    // Log initialization
    ctx.config.logger?.info?.("Kling 2.5 plugin initialized");
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
          model: MODELS.TEXT_TO_VIDEO,
          input: {
            prompt: options.prompt,
            duration: options.duration,
            aspect_ratio: options.aspect_ratio,
            negative_prompt: options.negative_prompt,
            cfg_scale: options.cfg_scale,
          },
          callBackUrl: options.callBackUrl,
        };

        // Make HTTP request
        const response = await client.post<{
          code: number;
          msg: string;
          data: { taskId: string };
        }>(`${baseURL}/createTask`, payload);

        // Return task ID
        return {
          taskId: response.data.taskId,
        };
      },

      /**
       * Generate video from image
       */
      async imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateImageToVideoOptions(options);

        // Prepare request payload
        const payload = {
          model: MODELS.IMAGE_TO_VIDEO,
          input: {
            prompt: options.prompt,
            image_url: options.image_url,
            duration: options.duration,
            negative_prompt: options.negative_prompt,
            cfg_scale: options.cfg_scale,
          },
          callBackUrl: options.callBackUrl,
        };

        // Make HTTP request
        const response = await client.post<{
          code: number;
          msg: string;
          data: { taskId: string };
        }>(`${baseURL}/createTask`, payload);

        // Return task ID
        return {
          taskId: response.data.taskId,
        };
      },

      /**
       * Get task record by ID
       */
      async getTaskRecord(taskId: string): Promise<TaskRecord> {
        // Validate task ID
        validateTaskId(taskId);

        // Make HTTP request
        const response = await client.get<{
          code: number;
          msg: string;
          data: {
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
          };
        }>(`${baseURL}/recordInfo`, {
          params: { taskId },
        });

        const data = response.data;

        // Parse result JSON if available
        let result: VideoResult | null = null;
        try {
          if (data.resultJson) {
            result = JSON.parse(data.resultJson);
          }
        } catch {
          result = null;
        }

        // Return formatted task record
        return {
          taskId: data.taskId,
          model: data.model,
          state: data.state as TaskRecord["state"],
          param: data.param,
          result,
          resultJson: data.resultJson,
          failCode: data.failCode,
          failMsg: data.failMsg,
          costTime: data.costTime,
          completeTime: data.completeTime,
          createTime: data.createTime,
        };
      },
    };
  },

  onDispose: () => {
    // Cleanup resources if needed
  },
};

// Export types
export type { Kling25API } from "./api";
export * from "./api";
