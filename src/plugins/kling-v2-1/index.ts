/**
 * Kling V2.1 Plugin
 * Kling AI video generation API plugin
 */

import type { Plugin, PluginContext } from "../../core/types";
import type {
  KlingV21API,
  MasterTextToVideoOptions,
  MasterImageToVideoOptions,
  StandardImageToVideoOptions,
  ProImageToVideoOptions,
  TaskResponse,
  TaskRecord,
  ParsedTaskRecord,
  VideoResult,
} from "./api";
import {
  validateMasterTextToVideoOptions,
  validateMasterImageToVideoOptions,
  validateStandardImageToVideoOptions,
  validateProImageToVideoOptions,
  validateTaskId,
} from "./validators";

/**
 * Model identifiers
 */
const MODEL_MAPPING = {
  masterTextToVideo: "kling/v2-1-master-text-to-video",
  masterImageToVideo: "kling/v2-1-master-image-to-video",
  standard: "kling/v2-1-standard",
  pro: "kling/v2-1-pro",
} as const;

/**
 * Kling V2.1 Plugin definition
 */
export const KlingV21Plugin: Plugin<KlingV21API> = {
  name: "kling-v2-1",
  version: "1.0.0",

  meta: {
    name: "kling-v2-1",
    version: "1.0.0",
    description: "Kling AI V2.1 video generation plugin",
    author: "KieAI",
    docs: "https://kie.ai/kling/v2-1",
  },

  onInit: (ctx: PluginContext) => {
    // Check configuration
    if (!ctx.config.apiKey) {
      throw new Error("Kling V2.1 plugin requires API key");
    }

    // Optional logging
    ctx.config.logger?.info?.("Kling V2.1 plugin initialized");
  },

  factory: (ctx: PluginContext) => {
    const { client } = ctx;
    const baseURL = "/api/v1/jobs";

    /**
     * Parse task record response
     */
    function parseTaskRecord(response: TaskRecord): ParsedTaskRecord {
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

      return {
        taskId: response.taskId,
        model: response.model,
        state: response.state,
        param,
        result,
        failCode: response.failCode,
        failMsg: response.failMsg,
        costTime: response.costTime,
        completeTime: response.completeTime,
        createTime: response.createTime,
      };
    }

    return {
      /**
       * Generate video from text using Master Text-to-Video model
       */
      async masterTextToVideo(
        options: MasterTextToVideoOptions,
      ): Promise<TaskResponse> {
        // Validate input parameters
        validateMasterTextToVideoOptions(options);

        // Prepare request payload
        const payload = {
          model: MODEL_MAPPING.masterTextToVideo,
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
       * Generate video from image using Master Image-to-Video model
       */
      async masterImageToVideo(
        options: MasterImageToVideoOptions,
      ): Promise<TaskResponse> {
        // Validate input parameters
        validateMasterImageToVideoOptions(options);

        // Prepare request payload
        const payload = {
          model: MODEL_MAPPING.masterImageToVideo,
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
       * Generate video from image using Standard model
       */
      async standardImageToVideo(
        options: StandardImageToVideoOptions,
      ): Promise<TaskResponse> {
        // Validate input parameters
        validateStandardImageToVideoOptions(options);

        // Prepare request payload
        const payload = {
          model: MODEL_MAPPING.standard,
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
       * Generate video from image using Pro model
       */
      async proImageToVideo(
        options: ProImageToVideoOptions,
      ): Promise<TaskResponse> {
        // Validate input parameters
        validateProImageToVideoOptions(options);

        // Prepare request payload
        const payload = {
          model: MODEL_MAPPING.pro,
          input: {
            prompt: options.prompt,
            image_url: options.image_url,
            duration: options.duration,
            negative_prompt: options.negative_prompt,
            cfg_scale: options.cfg_scale,
            tail_image_url: options.tail_image_url,
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
      async getTaskRecord(taskId: string): Promise<ParsedTaskRecord> {
        // Validate task ID
        validateTaskId(taskId);

        // Make HTTP request
        const response = await client.get<{
          code: number;
          msg: string;
          data: TaskRecord;
        }>(`${baseURL}/recordInfo`, {
          params: { taskId },
        });

        // Parse and return formatted task record
        return parseTaskRecord(response.data);
      },
    };
  },

  onDispose: () => {
    // Cleanup resources if needed
  },
};

// Export types
export type { KlingV21API } from "./api";
export * from "./api";
