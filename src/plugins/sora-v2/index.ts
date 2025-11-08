/**
 * Sora 2 Plugin
 * OpenAI Sora 2 video generation API plugin
 */

import type { Plugin, PluginContext } from "../../core/types";
import type {
  SoraV2API,
  TextToVideoOptions,
  ImageToVideoOptions,
  TaskResponse,
  TaskRecord,
  ParsedTaskRecord,
  VideoResult,
  ModelMode,
} from "./api";
import {
  validateTextToVideoOptions,
  validateImageToVideoOptions,
  validateTaskId,
} from "./validators";

/**
 * Model identifiers based on mode
 */
const MODEL_MAPPING = {
  textToVideo: {
    standard: "sora-2-text-to-video",
    pro: "sora-2-pro-text-to-video",
  },
  imageToVideo: {
    standard: "sora-2-image-to-video",
    pro: "sora-2-pro-image-to-video",
  },
} as const;

/**
 * Get model identifier based on type and mode
 */
function getModelId(
  type: "textToVideo" | "imageToVideo",
  mode: ModelMode = "standard",
): string {
  return MODEL_MAPPING[type][mode];
}

/**
 * Sora 2 Plugin definition
 */
export const SoraV2Plugin: Plugin<SoraV2API> = {
  name: "sora-v2",
  version: "1.0.0",

  meta: {
    name: "sora-v2",
    version: "1.0.0",
    description: "OpenAI Sora 2 and Sora 2 Pro video generation plugin",
    author: "KieAI",
    docs: "https://kie.ai/sora-2",
  },

  onInit: (ctx: PluginContext) => {
    // Check configuration
    if (!ctx.config.apiKey) {
      throw new Error("Sora 2 plugin requires API key");
    }

    // Optional logging
    ctx.config.logger?.info?.("Sora 2 plugin initialized");
  },

  factory: (ctx: PluginContext) => {
    const { client } = ctx;
    const baseURL = "/api/v1/jobs";

    return {
      /**
       * Generate video from text prompt
       */
      async textToVideo(options: TextToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateTextToVideoOptions(options);

        // Determine model based on mode
        const mode = options.mode || "standard";
        const model = getModelId("textToVideo", mode);

        // Prepare request payload
        const { mode: _, ...optionsWithoutMode } = options;
        const payload = {
          model,
          input: {
            prompt: optionsWithoutMode.prompt,
            aspect_ratio: optionsWithoutMode.aspect_ratio,
            n_frames: optionsWithoutMode.n_frames,
            size: optionsWithoutMode.size,
            remove_watermark: optionsWithoutMode.remove_watermark,
          },
          callBackUrl: optionsWithoutMode.callBackUrl,
        };

        // Make HTTP request
        return client.post<TaskResponse>(`${baseURL}/createTask`, payload);
      },

      /**
       * Generate video from image and text prompt
       */
      async imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse> {
        // Validate input parameters
        validateImageToVideoOptions(options);

        // Determine model based on mode
        const mode = options.mode || "standard";
        const model = getModelId("imageToVideo", mode);

        // Prepare request payload
        const { mode: _, ...optionsWithoutMode } = options;
        const payload = {
          model,
          input: {
            prompt: optionsWithoutMode.prompt,
            image_urls: optionsWithoutMode.image_urls,
            aspect_ratio: optionsWithoutMode.aspect_ratio,
            n_frames: optionsWithoutMode.n_frames,
            size: optionsWithoutMode.size,
            remove_watermark: optionsWithoutMode.remove_watermark,
          },
          callBackUrl: optionsWithoutMode.callBackUrl,
        };

        // Make HTTP request
        return client.post<TaskResponse>(`${baseURL}/createTask`, payload);
      },

      /**
       * Get task record by ID
       */
      async getTaskRecord(taskId: string): Promise<ParsedTaskRecord> {
        // Validate task ID
        validateTaskId(taskId);

        // Make HTTP request
        const response = await client.get<TaskRecord>(`${baseURL}/recordInfo`, {
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
          state: response.state,
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
export type { SoraV2API } from "./api";
export * from "./api";
