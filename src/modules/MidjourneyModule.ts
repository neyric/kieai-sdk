import { BaseModule } from "../core/BaseModule";
import { createValidationError } from "../types/errors";
import {
  type MidjourneyGenerateRequest,
  type MidjourneyGenerateVideoExtendRequest,
  type MidjourneyUpscaleRequest,
  type MidjourneyVaryRequest,
  type MidjourneyTaskGenerateResponse,
  type MidjourneyTaskData,
  type MidjourneyCallbackData,
} from "../types/modules/midjourney";

/**
 * Midjourney 图片生成模块
 */
export class MidjourneyModule extends BaseModule {
  /**
   * 基础生成方法 - 统一入口
   */
  private async generate(request: MidjourneyGenerateRequest) {
    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      `/api/v1/mj/generate`,
      request
    );
  }

  /**
   * 文本生成图片
   */
  async generateTextToImage(
    options: Omit<MidjourneyGenerateRequest, "taskType" | "fileUrls">
  ) {
    return this.generate({
      taskType: "mj_txt2img",
      ...options,
      fileUrls: undefined,
    });
  }

  /**
   * 图片生成图片
   */
  async generateImageToImage(
    options: Omit<MidjourneyGenerateRequest, "taskType"> & {
      fileUrls: string[];
    }
  ) {
    if (!options.fileUrls.length) {
      throw createValidationError(
        "fileUrls is required for image to image generation"
      );
    }

    return this.generate({
      taskType: "mj_img2img",
      ...options,
    });
  }

  /**
   * 风格参考生成
   */
  async generateStyleReference(
    options: Omit<MidjourneyGenerateRequest, "taskType"> & {
      fileUrls: string[];
    }
  ) {
    if (!options.fileUrls?.length) {
      throw createValidationError(
        "fileUrls is required for style reference generation"
      );
    }

    return this.generate({
      taskType: "mj_style_reference",
      ...options,
    });
  }

  /**
   * Omni 参考生成
   */
  async generateOmniReference(
    options: Omit<MidjourneyGenerateRequest, "taskType"> & {
      fileUrls: string[];
    }
  ) {
    if (!options.fileUrls?.length) {
      throw createValidationError(
        "fileUrls is required for omni reference generation"
      );
    }
    if (options.ow && (options.ow < 1 || options.ow > 1000)) {
      throw createValidationError("ow parameter must be between 1 and 1000");
    }

    return this.generate({
      taskType: "mj_omni_reference",
      ...options,
    });
  }

  /**
   * 生成视频
   */
  async generateVideo(
    options: Omit<MidjourneyGenerateRequest, "taskType" | "speed" | "ow"> & {
      motion: Exclude<MidjourneyGenerateRequest["motion"], undefined>;
    }
  ) {
    return this.generate({
      taskType: "mj_video",
      ...options,
    });
  }

  /**
   * 生成高清视频
   */
  async generateVideoHD(
    options: Omit<MidjourneyGenerateRequest, "taskType" | "speed" | "ow"> & {
      motion: Exclude<MidjourneyGenerateRequest["motion"], undefined>;
    }
  ) {
    return this.generate({
      taskType: "mj_video_hd",
      ...options,
    });
  }

  /**
   * 扩展视频 - 手动模式
   */
  async extendVideoManual(options: MidjourneyGenerateVideoExtendRequest) {
    const { taskType, prompt } = options;
    if (taskType === "mj_video_extend_manual" && !prompt) {
      throw createValidationError(
        "prompt is required for manual video extension"
      );
    }

    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      `/api/v1/mj/generateVideoExtend`,
      options
    );
  }

  /** 图片放大 */
  async upscale(options: MidjourneyUpscaleRequest) {
    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      "/api/v1/mj/generateUpscale",
      options
    );
  }

  /**
   * 图片变体
   */
  async vary(options: MidjourneyVaryRequest) {
    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      `/api/v1/mj/generateVary`,
      options
    );
  }

  /**
   * 查询任务状态
   */
  async getTaskDetails(taskId: string) {
    if (!taskId) throw createValidationError("taskId is required");

    const response = await this.httpClient.get<MidjourneyTaskData>(
      `/api/v1/mj/record-info`,
      { taskId }
    );

    return response;
  }

  /**
   * 验证回调数据
   */
  async verifyCallback(callbackData: unknown) {
    const data = callbackData as APIResponse<MidjourneyCallbackData>;
    if (!data?.data?.taskId) {
      throw createValidationError("Invalid callback data: taskId is required");
    }
    return this.getTaskDetails(data.data?.taskId);
  }
}
