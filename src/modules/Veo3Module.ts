import { BaseModule } from "../core/BaseModule";
import { createValidationError } from "../types/errors";
import {
  type Veo3GenerateOptions,
  type Veo3TextToVideoOptions,
  type Veo3ImageToVideoOptions,
  type Veo3GenerateResponse,
  type Veo3TaskData,
  type Veo3Task1080pVideoResult,
  type Veo3TaskCallbackData,
} from "../types/modules/veo3";

/**
 * Veo3 视频生成模块
 */
export class Veo3Module extends BaseModule {
  /**
   * 生成视频（统一入口）
   */
  async generate(options: Veo3GenerateOptions) {
    return this.httpClient.post<Veo3GenerateResponse>(
      "/api/v1/veo/generate",
      options
    );
  }

  /**
   * 文本转视频
   */
  async generateTextToVideo(options: Veo3TextToVideoOptions) {
    if (!options.prompt) {
      throw createValidationError("prompt is required");
    }

    return this.generate(options);
  }

  /**
   * 图片转视频
   */
  async generateImageToVideo(options: Veo3ImageToVideoOptions) {
    if (!options.prompt) {
      throw createValidationError("prompt is required");
    }

    if (!options.imageUrl) {
      throw createValidationError("imageUrl is required");
    }

    return this.generate({
      ...options,
      imageUrls: [options.imageUrl],
    });
  }

  /**
   * 获取任务详情
   */
  async getTaskDetails(taskId: string) {
    if (!taskId) {
      throw createValidationError("taskId is required");
    }

    return this.httpClient.get<Veo3TaskData>("/api/v1/veo/record-info", {
      taskId,
    });
  }

  /**
   * 获取Veo3视频生成任务的高清1080P版本。
   * - 通过托底模式生成的视频无法通过此接口访问，因为它们默认已经是1080p分辨率。
   * - 仅 16:9 宽高比的视频支持 1080P 高清生成
   * - 视频生成任务成功后，系统会自动开始生成 1080P 高清版本
   * - 1080P 视频生成需要额外处理时间，建议在原视频生成完成后等待一段时间再调用本接口
   * - 如果 1080P 视频尚未准备好，接口可能返回错误信息
   * ## 重要说明
   * 1. 只有成功生成的视频任务才能获取 1080P 的版本
   * 2. 建议在收到视频生成成功回调后等待几分钟再调用本接口
   */
  async get1080pVideo(taskId: string) {
    if (!taskId) {
      throw createValidationError("taskId is required");
    }

    return this.httpClient.get<Veo3Task1080pVideoResult>(
      "/api/v1/veo/get-1080p-video",
      { taskId }
    );
  }

  /**
   * 验证回调数据
   */
  async verifyCallback(callbackData: unknown) {
    const data = callbackData as Veo3TaskCallbackData;
    if (!data?.taskId) {
      throw createValidationError("Invalid callback data: taskId is required");
    }
    return this.getTaskDetails(data.taskId);
  }
}
