import { BaseModule } from "../core/BaseModule";
import { createValidationError } from "../types/errors";
import {
  type RunwayTextToVideoOptions,
  type RunwayImageToVideoOptions,
  type RunwayExtendVideoRequest,
  type RunwayGenerateResponse,
  type RunwayTaskData,
  type RunwayVideoResult,
  type RunwayAlephGenerateOptions,
  type RunwayAlephGenerateResponse,
  type RunwayAlephGenerateResult,
  type RunwayAlephCallbackData,
} from "../types/modules/runway";

/**
 * Runway 视频生成模块
 * 支持文本转视频、图片转视频、视频扩展、Aleph 视频转换等功能
 */
export class RunwayModule extends BaseModule {
  private readonly apiPath = "";

  /**
   * 基础生成方法 - 统一入口
   */
  private async generate(
    request: RunwayTextToVideoOptions | RunwayImageToVideoOptions
  ) {
    return this.httpClient.post<RunwayGenerateResponse>(
      "/api/v1/runway/generate",
      request
    );
  }

  /**
   * 文本转视频
   */
  async generateTextToVideo(options: RunwayTextToVideoOptions) {
    if (!options.prompt) {
      throw createValidationError("prompt is required");
    }

    if (options.quality === "1080p" && options.duration === 10) {
      throw createValidationError(
        "1080p quality only supports 5 second videos"
      );
    }

    return this.generate(options);
  }

  /**
   * 图片转视频
   */
  async generateImageToVideo(options: RunwayImageToVideoOptions) {
    if (!options.prompt) {
      throw createValidationError("prompt is required");
    }

    if (!options.imageUrl) {
      throw createValidationError("imageUrl is required");
    }

    if (options.quality === "1080p" && options.duration === 10) {
      throw createValidationError(
        "1080p quality only supports 5 second videos"
      );
    }

    return this.generate(options);
  }

  /**
   * 扩展视频
   */
  async extendVideo(options: RunwayExtendVideoRequest) {
    if (!options.taskId) {
      throw createValidationError("taskId is required");
    }

    if (!options.prompt) {
      throw createValidationError("prompt is required");
    }

    return this.httpClient.post<RunwayGenerateResponse>(
      "/api/v1/runway/extend",
      options
    );
  }

  /**
   * 获取任务详情
   */
  async getTaskDetails(taskId: string): Promise<RunwayTaskData> {
    if (!taskId) {
      throw createValidationError("taskId is required");
    }

    return this.httpClient.get<RunwayTaskData>("/api/v1/runway/record-detail", {
      taskId,
    });
  }

  /**
   * 验证回调数据
   */
  async verifyCallback(callbackData: unknown) {
    const data = callbackData as APIResponse<RunwayVideoResult>;
    if (!data?.data?.task_id) {
      throw createValidationError("Invalid callback data: taskId is required");
    }
    return this.getTaskDetails(data.data.task_id);
  }

  /**
   * Aleph 视频生成（视频到视频转换）
   */
  async generateAlephVideo(options: RunwayAlephGenerateOptions) {
    if (!options.prompt) {
      throw createValidationError("prompt is required");
    }

    if (!options.videoUrl) {
      throw createValidationError("videoUrl is required");
    }

    return this.httpClient.post<RunwayAlephGenerateResponse>(
      "/api/v1/aleph/generate",
      options
    );
  }

  /**
   * 获取任务详情
   */
  async getAlephTaskDetails(taskId: string) {
    if (!taskId) {
      throw createValidationError("taskId is required");
    }

    return this.httpClient.get<RunwayAlephGenerateResult>(
      "/api/v1/aleph/record-info",
      {
        taskId,
      }
    );
  }

  /**
   * 验证回调数据
   */
  async verifyAlephCallback(callbackData: unknown) {
    const data = callbackData as RunwayAlephCallbackData;
    if (!data?.taskId) {
      throw createValidationError("Invalid callback data: taskId is required");
    }
    return this.getTaskDetails(data.taskId);
  }
}
