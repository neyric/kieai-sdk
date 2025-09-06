import { BaseModule } from '../core/BaseModule';
import { createValidationError, createApiError } from '../types/errors';
import {
  type RunwayTextToVideoOptions,
  type RunwayImageToVideoOptions,
  type RunwayExtendVideoOptions,
  type RunwayWaitForCompletionOptions,
  type RunwayTextToVideoRequest,
  type RunwayImageToVideoRequest,
  type RunwayExtendVideoRequest,
  type RunwayGenerateResponse,
  type RunwayTaskDetailsResponse,
  type RunwayTaskData,
  type RunwayGenerationResult,
  type RunwayAspectRatio,
  type RunwayVideoQuality,
  type RunwayVideoDuration,
} from '../types/modules/runway';

/**
 * Runway 视频生成模块
 * 基于 Runway API 实现文本转视频、图片转视频、视频扩展等功能
 */
export class RunwayModule extends BaseModule {
  private readonly apiPath = '/api/v1/runway';

  /**
   * 文本转视频
   * @param options 生成选项
   * @returns 任务ID
   */
  async generateTextToVideo(options: RunwayTextToVideoOptions): Promise<string> {
    this.validateTextToVideoOptions(options);

    const request: RunwayTextToVideoRequest = {
      prompt: options.prompt,
      duration: options.duration || 5,
      quality: options.quality || '720p',
      aspectRatio: options.aspectRatio || '16:9',
      waterMark: options.waterMark || '',
      callBackUrl: options.callBackUrl,
    };

    const response = await this.httpClient.post<RunwayGenerateResponse>(
      `${this.apiPath}/generate`,
      this.cleanParams(request)
    );

    this.handleApiResponse(response, '文本转视频失败');
    return response.data.taskId;
  }

  /**
   * 图片转视频
   * @param options 生成选项
   * @returns 任务ID
   */
  async generateImageToVideo(options: RunwayImageToVideoOptions): Promise<string> {
    this.validateImageToVideoOptions(options);

    const request: RunwayImageToVideoRequest = {
      prompt: options.prompt,
      imageUrl: options.imageUrl,
      duration: options.duration || 5,
      quality: options.quality || '720p',
      aspectRatio: options.aspectRatio || '16:9',
      waterMark: options.waterMark || '',
      callBackUrl: options.callBackUrl,
    };

    const response = await this.httpClient.post<RunwayGenerateResponse>(
      `${this.apiPath}/generate`,
      this.cleanParams(request)
    );

    this.handleApiResponse(response, '图片转视频失败');
    return response.data.taskId;
  }

  /**
   * 扩展视频
   * @param options 扩展选项
   * @returns 新的任务ID
   */
  async extendVideo(options: RunwayExtendVideoOptions): Promise<string> {
    this.validateExtendVideoOptions(options);

    const request: RunwayExtendVideoRequest = {
      taskId: options.taskId,
      prompt: options.prompt,
      quality: options.quality || '720p',
      callBackUrl: options.callBackUrl,
    };

    const response = await this.httpClient.post<RunwayGenerateResponse>(
      `${this.apiPath}/extend`,
      this.cleanParams(request)
    );

    this.handleApiResponse(response, '视频扩展失败');
    return response.data.taskId;
  }

  /**
   * 查询任务状态
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskDetails(taskId: string): Promise<RunwayTaskData> {
    const requiredFields = ['taskId'];
    this.validateParams({ taskId }, requiredFields);

    const response = await this.httpClient.get<RunwayTaskDetailsResponse>(
      `${this.apiPath}/record-detail`,
      { taskId }
    );

    this.handleApiResponse(response, '任务状态查询失败');
    return response.data;
  }

  /**
   * 等待任务完成
   * @param taskId 任务ID
   * @param options 等待选项
   * @returns 生成结果
   */
  async waitForCompletion(
    taskId: string,
    options?: RunwayWaitForCompletionOptions
  ): Promise<RunwayGenerationResult> {
    const {
      maxWaitTime = 600000, // 10分钟
      pollInterval = 30000,  // 30秒
      onProgress,
    } = options || {};

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const taskData = await this.getTaskDetails(taskId);

      // 调用进度回调
      if (onProgress) {
        onProgress(taskData);
      }

      switch (taskData.state) {
        case 'wait':
        case 'queueing':
        case 'generating':
          // 继续等待
          break;

        case 'success':
          if (!taskData.videoInfo) {
            throw new Error('任务完成但没有返回视频数据');
          }
          return taskData as RunwayGenerationResult;

        case 'fail':
          const errorMessage = taskData.failMsg || '视频生成失败';
          throw createApiError('GENERATION_FAILED', errorMessage);

        default:
          throw new Error(`未知任务状态: ${taskData.state}`);
      }

      // 等待下次轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`任务超时，等待时间超过 ${maxWaitTime}ms`);
  }


  /**
   * 一键生成文本转视频并等待完成（便捷方法）
   * @param options 生成选项
   * @param waitOptions 等待选项
   * @returns 生成结果
   */
  async generateTextToVideoAndWait(
    options: RunwayTextToVideoOptions,
    waitOptions?: RunwayWaitForCompletionOptions
  ): Promise<RunwayGenerationResult> {
    const taskId = await this.generateTextToVideo(options);
    return this.waitForCompletion(taskId, waitOptions);
  }

  /**
   * 一键生成图片转视频并等待完成（便捷方法）
   * @param options 生成选项
   * @param waitOptions 等待选项
   * @returns 生成结果
   */
  async generateImageToVideoAndWait(
    options: RunwayImageToVideoOptions,
    waitOptions?: RunwayWaitForCompletionOptions
  ): Promise<RunwayGenerationResult> {
    const taskId = await this.generateImageToVideo(options);
    return this.waitForCompletion(taskId, waitOptions);
  }

  /**
   * 一键扩展视频并等待完成（便捷方法）
   * @param options 扩展选项
   * @param waitOptions 等待选项
   * @returns 扩展结果
   */
  async extendVideoAndWait(
    options: RunwayExtendVideoOptions,
    waitOptions?: RunwayWaitForCompletionOptions
  ): Promise<RunwayGenerationResult> {
    const taskId = await this.extendVideo(options);
    return this.waitForCompletion(taskId, waitOptions);
  }

  // 私有方法：统一处理API响应
  private handleApiResponse(response: { code: number; msg: string }, errorContext: string): void {
    if (response.code !== 200) {
      throw createApiError(response.code.toString(), `${errorContext}: ${response.msg}`);
    }
  }

  // 私有验证方法

  private validateTextToVideoOptions(options: RunwayTextToVideoOptions): void {
    const requiredFields = ['prompt'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (options.quality === '1080p' && options.duration === 10) {
      throw createValidationError('1080p 质量只支持 5 秒视频');
    }

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl 不是有效的 URL');
    }
  }

  private validateImageToVideoOptions(options: RunwayImageToVideoOptions): void {
    const requiredFields = ['prompt', 'imageUrl'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (options.quality === '1080p' && options.duration === 10) {
      throw createValidationError('1080p 质量只支持 5 秒视频');
    }

    if (!this.isValidUrl(options.imageUrl)) {
      throw createValidationError('imageUrl 不是有效的 URL');
    }

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl 不是有效的 URL');
    }
  }

  private validateExtendVideoOptions(options: RunwayExtendVideoOptions): void {
    const requiredFields = ['taskId', 'prompt'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl 不是有效的 URL');
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