import { BaseModule } from '../core/BaseModule';
import { createValidationError } from '../types/errors';
import {
  type Veo3GenerateOptions,
  type Veo3ImageToVideoOptions,
  type Veo3ExtendVideoOptions,
  type Veo3GenerateOptions,
  type Veo3ImageToVideoRequest,
  type Veo3ExtendVideoRequest,
  type Veo3GenerateResponse,
  type Veo3TaskDetailsResponse,
  type Veo3TaskData,
  type Veo3CallbackData,
} from '../types/modules/veo3';

/**
 * Veo3 视频生成模块
 * 基于 Kie 提供的 Veo3 API 实现文本转视频、图片转视频、视频延长等功能
 */
export class Veo3Module extends BaseModule {
  private readonly apiPath = '/api/v1/runway';

  /**
   * 基础生成方法 - 统一入口
   */
  private async generate(request: Veo3GenerateOptions | Veo3ImageToVideoRequest) {
    return this.httpClient.post<Veo3GenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );
  }

  /**
   * 文本转视频
   * @param options 生成选项
   * @returns 生成响应
   */
  async generateTextToVideo(options: Veo3GenerateOptions) {
    this.validateTextToVideoOptions(options);

    const request: Veo3GenerateOptions = {
      prompt: options.prompt,
      duration: options.duration || 5,
      quality: options.quality || '720p',
      aspectRatio: options.aspectRatio || '16:9',
      waterMark: options.waterMark || '',
      callBackUrl: options.callBackUrl,
    };

    return this.generate(this.cleanParams(request) as Veo3GenerateOptions);
  }

  /**
   * 图片转视频
   * @param options 生成选项
   * @returns 生成响应
   */
  async generateImageToVideo(options: Veo3ImageToVideoOptions) {
    this.validateImageToVideoOptions(options);

    const request: Veo3ImageToVideoRequest = {
      prompt: options.prompt,
      imageUrl: options.imageUrl,
      duration: options.duration || 5,
      quality: options.quality || '720p',
      aspectRatio: options.aspectRatio || '16:9',
      waterMark: options.waterMark || '',
      callBackUrl: options.callBackUrl,
    };

    return this.generate(this.cleanParams(request) as Veo3ImageToVideoRequest);
  }

  /**
   * 延长视频
   * @param options 延长选项
   * @returns 延长响应
   */
  async extendVideo(options: Veo3ExtendVideoOptions) {
    this.validateExtendVideoOptions(options);

    const request: Veo3ExtendVideoRequest = {
      taskId: options.taskId,
      prompt: options.prompt,
      quality: options.quality || '720p',
      callBackUrl: options.callBackUrl,
    };

    return this.httpClient.post<Veo3GenerateResponse>(
      `${this.apiPath}/extend`,
      this.cleanParams(request)
    );
  }

  /**
   * 获取任务状态
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskStatus(taskId: string): Promise<Veo3TaskData> {
    if (!taskId) {
      throw createValidationError('taskId is required');
    }

    const response = await this.httpClient.get<Veo3TaskData>(
      `${this.apiPath}/record-detail`,
      { taskId }
    );

    return response;
  }

  /**
   * 查询任务详情（别名方法，与其他模块保持一致）
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskDetails(taskId: string): Promise<Veo3TaskData> {
    return this.getTaskStatus(taskId);
  }

  /**
   * 等待任务完成
   * @param taskId 任务ID
   * @param maxWaitTime 最大等待时间（毫秒），默认10分钟
   * @param interval 查询间隔（毫秒），默认30秒
   * @returns 完成的任务数据
   */
  async waitForCompletion(
    taskId: string, 
    maxWaitTime = 600000, 
    interval = 30000
  ): Promise<Veo3TaskData> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getTaskStatus(taskId);
      
      if (status.state === 'success') {
        return status;
      }
      
      if (status.state === 'fail') {
        throw new Error(status.failMsg || '任务生成失败');
      }
      
      // 等待指定时间后再查询
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('任务超时');
  }

  /**
   * 验证 Callback 请求，返回对应的 Task 结果
   * @param callbackData callback 携带的数据
   */
  async verifyCallback(callbackData: unknown) {
    const data = callbackData as Veo3CallbackData;
    if (!data.taskId) {
      throw createValidationError('Invalid taskId');
    }
    return this.getTaskStatus(data.taskId);
  }

  // 私有验证方法
  private validateTextToVideoOptions(options: Veo3GenerateOptions): void {
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

  private validateImageToVideoOptions(options: Veo3ImageToVideoOptions): void {
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

  private validateExtendVideoOptions(options: Veo3ExtendVideoOptions): void {
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