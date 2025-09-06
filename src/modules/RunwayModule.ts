import { BaseModule } from '../core/BaseModule';
import { createValidationError } from '../types/errors';
import {
  type RunwayTextToVideoOptions,
  type RunwayImageToVideoOptions,
  type RunwayExtendVideoOptions,
  type RunwayTextToVideoOptions,
  type RunwayImageToVideoOptions,
  type RunwayExtendVideoRequest,
  type RunwayGenerateResponse,
  type RunwayTaskDetailsResponse,
  type RunwayTaskData,
  type RunwayCallbackData,
} from '../types/modules/runway';

/**
 * Runway 视频生成模块
 * 基于 Runway API 实现文本转视频、图片转视频、视频扩展等功能
 */
export class RunwayModule extends BaseModule {
  private readonly apiPath = '/api/v1/runway';

  /**
   * 基础生成方法 - 统一入口
   */
  private async generate(request: RunwayTextToVideoOptions | RunwayImageToVideoOptions) {
    return this.httpClient.post<RunwayGenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );
  }

  /**
   * 文本转视频
   * @param options 生成选项
   * @returns 生成响应
   */
  async generateTextToVideo(options: RunwayTextToVideoOptions) {
    this.validateTextToVideoOptions(options);

    const request: RunwayTextToVideoOptions = {
      prompt: options.prompt,
      duration: options.duration || 5,
      quality: options.quality || '720p',
      aspectRatio: options.aspectRatio || '16:9',
      waterMark: options.waterMark || '',
      callBackUrl: options.callBackUrl,
    };

    return this.generate(this.cleanParams(request));
  }

  /**
   * 图片转视频
   * @param options 生成选项
   * @returns 生成响应
   */
  async generateImageToVideo(options: RunwayImageToVideoOptions) {
    this.validateImageToVideoOptions(options);

    const request: RunwayImageToVideoOptions = {
      prompt: options.prompt,
      imageUrl: options.imageUrl,
      duration: options.duration || 5,
      quality: options.quality || '720p',
      aspectRatio: options.aspectRatio || '16:9',
      waterMark: options.waterMark || '',
      callBackUrl: options.callBackUrl,
    };

    return this.generate(this.cleanParams(request));
  }

  /**
   * 扩展视频
   * @param options 扩展选项
   * @returns 扩展响应
   */
  async extendVideo(options: RunwayExtendVideoOptions) {
    this.validateExtendVideoOptions(options);

    const request: RunwayExtendVideoRequest = {
      taskId: options.taskId,
      prompt: options.prompt,
      quality: options.quality || '720p',
      callBackUrl: options.callBackUrl,
    };

    return this.httpClient.post<RunwayGenerateResponse>(
      `${this.apiPath}/extend`,
      this.cleanParams(request)
    );
  }

  /**
   * 获取任务状态（与其他模块保持一致的命名）
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskStatus(taskId: string): Promise<RunwayTaskData> {
    if (!taskId) {
      throw createValidationError('taskId is required');
    }

    const response = await this.httpClient.get<RunwayTaskDetailsResponse>(
      `${this.apiPath}/record-detail`,
      { taskId }
    );

    return response;
  }

  /**
   * 验证 Callback 请求，返回对应的 Task 结果
   * @param callbackData callback 携带的数据
   */
  async verifyCallback(callbackData: unknown) {
    const data = callbackData as RunwayCallbackData;
    if (!data.taskId) throw createValidationError('Invalid taskId');
    return this.getTaskStatus(data.taskId);
  }

  // 私有验证方法
  private validateTextToVideoOptions(options: RunwayTextToVideoOptions): void {
    if (!options.prompt) {
      throw createValidationError('prompt is required');
    }

    if (options.quality === '1080p' && options.duration === 10) {
      throw createValidationError('1080p quality only supports 5 second videos');
    }

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl is not a valid URL');
    }
  }

  private validateImageToVideoOptions(options: RunwayImageToVideoOptions): void {
    if (!options.prompt) {
      throw createValidationError('prompt is required');
    }

    if (!options.imageUrl) {
      throw createValidationError('imageUrl is required');
    }

    if (options.quality === '1080p' && options.duration === 10) {
      throw createValidationError('1080p quality only supports 5 second videos');
    }

    if (!this.isValidUrl(options.imageUrl)) {
      throw createValidationError('imageUrl is not a valid URL');
    }

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl is not a valid URL');
    }
  }

  private validateExtendVideoOptions(options: RunwayExtendVideoOptions): void {
    if (!options.taskId) {
      throw createValidationError('taskId is required');
    }

    if (!options.prompt) {
      throw createValidationError('prompt is required');
    }

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl is not a valid URL');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }
}