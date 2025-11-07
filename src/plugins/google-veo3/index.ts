/**
 * Google Veo3 Plugin
 * Provides video generation capabilities using Google's Veo3 model
 */

import type { Plugin, PluginContext } from "../../core/types";
import { createValidationError } from "../../core/errors";
import type { GoogleVeo3API } from "./api";
import {
  validateTextToVideoOptions,
  validateImageToVideoOptions,
  validateTaskId,
} from "./validators";
import type {
  Veo3GenerateOptions,
  Veo3TextToVideoOptions,
  Veo3ImageToVideoOptions,
  Veo3GenerateResponse,
  Veo3TaskData,
  Veo3Task1080pVideoResult,
  Veo3TaskCallbackData,
} from "./api";

/**
 * Google Veo3 Plugin
 * Supports text-to-video and image-to-video generation
 */
export const GoogleVeo3Plugin: Plugin<GoogleVeo3API> = {
  name: "google-veo3",
  version: "1.0.0",
  meta: {
    name: "google-veo3",
    version: "1.0.0",
    description:
      "Google Veo3 video generation plugin for text-to-video and image-to-video",
    author: "KieAI",
    docs: "https://docs.kie.ai/api-reference/veo3/overview",
  },

  /**
   * Initialize plugin and validate configuration
   */
  onInit: ({ config }: PluginContext) => {
    if (!config.apiKey) {
      throw createValidationError(
        "Google Veo3 plugin requires apiKey in SDK configuration",
        "apiKey",
      );
    }
  },

  /**
   * Factory function to create the plugin API
   */
  factory: ({ client }: PluginContext): GoogleVeo3API => {
    return {
      /**
       * Generate video (unified entry point)
       */
      async generate(
        options: Veo3GenerateOptions,
      ): Promise<Veo3GenerateResponse> {
        return client.post<Veo3GenerateResponse>(
          "/api/v1/veo/generate",
          options,
        );
      },

      /**
       * Generate video from text prompt
       */
      async generateTextToVideo(
        options: Veo3TextToVideoOptions,
      ): Promise<Veo3GenerateResponse> {
        validateTextToVideoOptions(options);
        return client.post<Veo3GenerateResponse>(
          "/api/v1/veo/generate",
          options,
        );
      },

      /**
       * Generate video from image and text prompt
       */
      async generateImageToVideo(
        options: Veo3ImageToVideoOptions,
      ): Promise<Veo3GenerateResponse> {
        validateImageToVideoOptions(options);

        // Transform single imageUrl to imageUrls array
        const requestOptions: Veo3GenerateOptions = {
          ...options,
          imageUrls: [options.imageUrl],
        };

        return client.post<Veo3GenerateResponse>(
          "/api/v1/veo/generate",
          requestOptions,
        );
      },

      /**
       * Get task details by task ID
       */
      async getTaskDetails(taskId: string): Promise<Veo3TaskData> {
        validateTaskId(taskId);
        return client.get<Veo3TaskData>("/api/v1/veo/record-info", {
          params: { taskId },
        });
      },

      /**
       * Get 1080p version of generated video
       * Only available for 16:9 aspect ratio videos
       * Note: Videos generated with fallback mode cannot use this endpoint
       */
      async get1080pVideo(taskId: string): Promise<Veo3Task1080pVideoResult> {
        validateTaskId(taskId);
        return client.get<Veo3Task1080pVideoResult>(
          "/api/v1/veo/get-1080p-video",
          { params: { taskId } },
        );
      },

      /**
       * Verify and process callback data
       */
      async verifyCallback(callbackData: unknown): Promise<Veo3TaskData> {
        const data = callbackData as Veo3TaskCallbackData;
        if (!data?.taskId) {
          throw createValidationError(
            "Invalid callback data: taskId is required",
            "taskId",
          );
        }
        return client.get<Veo3TaskData>("/api/v1/veo/record-info", {
          params: { taskId: data.taskId },
        });
      },
    };
  },
};

// Re-export types for convenience
export type {
  GoogleVeo3API,
  Veo3GenerateOptions,
  Veo3TextToVideoOptions,
  Veo3ImageToVideoOptions,
  Veo3GenerateResponse,
  Veo3TaskData,
  Veo3Task1080pVideoResult,
  Veo3TaskCallbackData,
} from "./api";
