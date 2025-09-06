import { BaseModule } from '../core/BaseModule';
import { createValidationError, createApiError } from '../types/errors';
import {
  MidjourneyTaskStatus,
  type MidjourneyGenerateRequest,
  type MidjourneyGenerateResponse,
  type MidjourneyUpscaleRequest,
  type MidjourneyUpscaleResponse,
  type MidjourneyVaryRequest,
  type MidjourneyVaryResponse,
  type MidjourneyTaskDetailsResponse,
  type MidjourneyTextToImageOptions,
  type MidjourneyImageToImageOptions,
  type MidjourneyImageToVideoOptions,
  type MidjourneyWaitForCompletionOptions,
  type MidjourneyTaskData,
  type MidjourneyTaskResponse,
  type MidjourneyAspectRatio,
  type MidjourneyVersion,
  type MidjourneySpeed,
  type MidjourneyTaskType,
} from '../types/modules/midjourney';

/**
 * Midjourney 图片生成模块
 * 基于 Midjourney API 实现文本生成图片、图片转图片、图片转视频等功能
 */
export class MidjourneyModule extends BaseModule {
  private readonly apiPath = '/api/v1/mj';

  /**
   * 文本生成图片
   * @param options 生成选项
   * @returns 任务ID
   */
  async generateTextToImage(options: MidjourneyTextToImageOptions): Promise<string> {
    this.validateTextToImageOptions(options);

    const request: MidjourneyGenerateRequest = {
      taskType: 'mj_txt2img',
      prompt: options.prompt,
      speed: options.speed || 'fast',
      aspectRatio: options.aspectRatio || '1:1',
      version: options.version || '7',
      stylization: options.stylization || 100,
      chaos: options.chaos,
      quality: options.quality || 1,
      repeat: options.repeat || 1,
      no: options.no,
      stop: options.stop,
      callBackUrl: options.callBackUrl,
      uploadCn: options.uploadCn || false,
      watermark: options.watermark,
    };

    const response = await this.httpClient.post<MidjourneyGenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );

    this.handleApiResponse(response, '文本生成图片失败');
    return response.data.taskId;
  }

  /**
   * 图片转图片
   * @param options 图片转换选项
   * @returns 任务ID
   */
  async generateImageToImage(options: MidjourneyImageToImageOptions): Promise<string> {
    this.validateImageToImageOptions(options);

    const request: MidjourneyGenerateRequest = {
      taskType: 'mj_img2img',
      prompt: options.prompt,
      fileUrl: options.fileUrl,
      speed: options.speed || 'fast',
      aspectRatio: options.aspectRatio || '1:1',
      version: options.version || '7',
      stylization: options.stylization || 100,
      chaos: options.chaos,
      quality: options.quality || 1,
      repeat: options.repeat || 1,
      no: options.no,
      stop: options.stop,
      callBackUrl: options.callBackUrl,
      uploadCn: options.uploadCn || false,
      watermark: options.watermark,
    };

    const response = await this.httpClient.post<MidjourneyGenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );

    this.handleApiResponse(response, '图片转图片失败');
    return response.data.taskId;
  }

  /**
   * 图片转视频
   * @param options 视频生成选项
   * @returns 任务ID
   */
  async generateImageToVideo(options: MidjourneyImageToVideoOptions): Promise<string> {
    this.validateImageToVideoOptions(options);

    const request: MidjourneyGenerateRequest = {
      taskType: 'mj_video',
      prompt: options.prompt,
      fileUrl: options.fileUrl,
      version: options.version || '7',
      callBackUrl: options.callBackUrl,
      uploadCn: options.uploadCn || false,
      watermark: options.watermark,
    };

    const response = await this.httpClient.post<MidjourneyGenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );

    this.handleApiResponse(response, '图片转视频失败');
    return response.data.taskId;
  }

  /**
   * 图片放大
   * @param taskId 原始任务ID
   * @param index 要放大的图片索引 (1-4)
   * @param callBackUrl 回调URL（可选）
   * @returns 新任务ID
   */
  async upscaleImage(taskId: string, index: number, callBackUrl?: string): Promise<string> {
    this.validateUpscaleOptions(taskId, index);

    const request: MidjourneyUpscaleRequest = {
      taskId,
      index,
      callBackUrl,
    };

    const response = await this.httpClient.post<MidjourneyUpscaleResponse>(
      `${this.apiPath}/upscale`,
      request
    );

    this.handleApiResponse(response, '图片放大失败');
    return response.data.taskId;
  }

  /**
   * 图片变体
   * @param taskId 原始任务ID
   * @param index 要变化的图片索引 (1-4)
   * @param varyType 变体类型，默认 'subtle'
   * @param callBackUrl 回调URL（可选）
   * @returns 新任务ID
   */
  async createVariation(
    taskId: string, 
    index: number, 
    varyType: 'subtle' | 'strong' = 'subtle',
    callBackUrl?: string
  ): Promise<string> {
    this.validateVaryOptions(taskId, index);

    const request: MidjourneyVaryRequest = {
      taskId,
      index,
      varyType,
      callBackUrl,
    };

    const response = await this.httpClient.post<MidjourneyVaryResponse>(
      `${this.apiPath}/vary`,
      request
    );

    this.handleApiResponse(response, '图片变体失败');
    return response.data.taskId;
  }

  /**
   * 查询任务状态
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskDetails(taskId: string): Promise<MidjourneyTaskData> {
    this.validateTaskId(taskId);

    const response = await this.httpClient.get<MidjourneyTaskDetailsResponse>(
      `${this.apiPath}/record-info`,
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
    options?: MidjourneyWaitForCompletionOptions
  ): Promise<MidjourneyTaskResponse> {
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

      switch (taskData.successFlag) {
        case MidjourneyTaskStatus.SUCCESS:
          if (!taskData.resultInfoJson) {
            throw new Error('任务完成但没有返回结果数据');
          }
          return taskData.resultInfoJson;

        case MidjourneyTaskStatus.TASK_FAILED:
          const taskError = taskData.errorMessage || '任务执行失败';
          const taskErrorDetails = taskData.errorCode ? ` (错误代码: ${taskData.errorCode})` : '';
          throw createApiError('TASK_FAILED', taskError + taskErrorDetails);

        case MidjourneyTaskStatus.GENERATE_FAILED:
          const generateError = taskData.errorMessage || '图片生成失败';
          const generateErrorDetails = taskData.errorCode ? ` (错误代码: ${taskData.errorCode})` : '';
          throw createApiError('GENERATE_FAILED', generateError + generateErrorDetails);

        case MidjourneyTaskStatus.GENERATING:
          // 继续等待
          break;

        default:
          throw new Error(`未知任务状态: ${taskData.successFlag}`);
      }

      // 等待下次轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`任务超时，等待时间超过 ${maxWaitTime}ms`);
  }

  /**
   * 一键生成文本转图片并等待完成（便捷方法）
   * @param options 生成选项
   * @param waitOptions 等待选项
   * @returns 生成结果
   */
  async generateTextToImageAndWait(
    options: MidjourneyTextToImageOptions,
    waitOptions?: MidjourneyWaitForCompletionOptions
  ): Promise<MidjourneyTaskResponse> {
    const taskId = await this.generateTextToImage(options);
    return this.waitForCompletion(taskId, waitOptions);
  }

  /**
   * 一键生成图片转图片并等待完成（便捷方法）
   * @param options 转换选项
   * @param waitOptions 等待选项
   * @returns 生成结果
   */
  async generateImageToImageAndWait(
    options: MidjourneyImageToImageOptions,
    waitOptions?: MidjourneyWaitForCompletionOptions
  ): Promise<MidjourneyTaskResponse> {
    const taskId = await this.generateImageToImage(options);
    return this.waitForCompletion(taskId, waitOptions);
  }

  /**
   * 一键生成图片转视频并等待完成（便捷方法）
   * @param options 视频生成选项
   * @param waitOptions 等待选项
   * @returns 生成结果
   */
  async generateImageToVideoAndWait(
    options: MidjourneyImageToVideoOptions,
    waitOptions?: MidjourneyWaitForCompletionOptions
  ): Promise<MidjourneyTaskResponse> {
    const taskId = await this.generateImageToVideo(options);
    return this.waitForCompletion(taskId, waitOptions);
  }

  /**
   * 一键放大并等待完成（便捷方法）
   * @param taskId 原始任务ID
   * @param index 要放大的图片索引 (1-4)
   * @param waitOptions 等待选项
   * @returns 放大结果
   */
  async upscaleImageAndWait(
    taskId: string,
    index: number,
    waitOptions?: MidjourneyWaitForCompletionOptions
  ): Promise<MidjourneyTaskResponse> {
    const upscaleTaskId = await this.upscaleImage(taskId, index);
    return this.waitForCompletion(upscaleTaskId, waitOptions);
  }

  /**
   * 一键变体并等待完成（便捷方法）
   * @param taskId 原始任务ID
   * @param index 要变化的图片索引 (1-4)
   * @param varyType 变体类型
   * @param waitOptions 等待选项
   * @returns 变体结果
   */
  async createVariationAndWait(
    taskId: string,
    index: number,
    varyType: 'subtle' | 'strong' = 'subtle',
    waitOptions?: MidjourneyWaitForCompletionOptions
  ): Promise<MidjourneyTaskResponse> {
    const varyTaskId = await this.createVariation(taskId, index, varyType);
    return this.waitForCompletion(varyTaskId, waitOptions);
  }

  // 私有方法：统一处理API响应
  private handleApiResponse(response: { code: number; msg: string }, errorContext: string): void {
    if (response.code !== 200) {
      throw createApiError(response.code.toString(), `${errorContext}: ${response.msg}`);
    }
  }

  // 私有验证方法

  private validateTextToImageOptions(options: MidjourneyTextToImageOptions): void {
    const requiredFields = ['prompt'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (options.prompt.length === 0) {
      throw createValidationError('prompt 不能为空');
    }

    if (options.aspectRatio && !this.isValidAspectRatio(options.aspectRatio)) {
      throw createValidationError('aspectRatio 必须是有效的宽高比格式');
    }

    if (options.version && !this.isValidVersion(options.version)) {
      throw createValidationError('version 必须是 "7", "6.1", "6" 或 "niji6"');
    }

    if (options.speed && !this.isValidSpeed(options.speed)) {
      throw createValidationError('speed 必须是 "relaxed", "fast" 或 "turbo"');
    }

    if (options.stylization !== undefined) {
      if (!Number.isInteger(options.stylization) || options.stylization < 0 || options.stylization > 1000) {
        throw createValidationError('stylization 必须是 0-1000 之间的整数');
      }
    }

    if (options.chaos !== undefined) {
      if (!Number.isInteger(options.chaos) || options.chaos < 0 || options.chaos > 100) {
        throw createValidationError('chaos 必须是 0-100 之间的整数');
      }
    }

    if (options.quality !== undefined && ![0.25, 0.5, 1, 2].includes(options.quality)) {
      throw createValidationError('quality 必须是 0.25, 0.5, 1 或 2');
    }

    if (options.repeat !== undefined) {
      if (!Number.isInteger(options.repeat) || options.repeat < 1 || options.repeat > 4) {
        throw createValidationError('repeat 必须是 1-4 之间的整数');
      }
    }

    if (options.stop !== undefined) {
      if (!Number.isInteger(options.stop) || options.stop < 10 || options.stop > 100) {
        throw createValidationError('stop 必须是 10-100 之间的整数');
      }
    }

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl 不是有效的 URL');
    }
  }

  private validateImageToImageOptions(options: MidjourneyImageToImageOptions): void {
    // 先验证基础文本转图片选项
    this.validateTextToImageOptions(options);

    // 验证图片转图片特有参数
    const requiredFields = ['fileUrl'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (!this.isValidUrl(options.fileUrl)) {
      throw createValidationError('fileUrl 不是有效的 URL');
    }
  }

  private validateImageToVideoOptions(options: MidjourneyImageToVideoOptions): void {
    const requiredFields = ['prompt', 'fileUrl'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (options.prompt.length === 0) {
      throw createValidationError('prompt 不能为空');
    }

    if (!this.isValidUrl(options.fileUrl)) {
      throw createValidationError('fileUrl 不是有效的 URL');
    }

    if (options.version && !this.isValidVersion(options.version)) {
      throw createValidationError('version 必须是 "7", "6.1", "6" 或 "niji6"');
    }

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl 不是有效的 URL');
    }
  }

  private validateUpscaleOptions(taskId: string, index: number): void {
    this.validateTaskId(taskId);

    if (!Number.isInteger(index) || index < 1 || index > 4) {
      throw createValidationError('index 必须是 1-4 之间的整数');
    }
  }

  private validateVaryOptions(taskId: string, index: number): void {
    this.validateTaskId(taskId);

    if (!Number.isInteger(index) || index < 1 || index > 4) {
      throw createValidationError('index 必须是 1-4 之间的整数');
    }
  }

  private validateTaskId(taskId: string): void {
    if (!taskId || typeof taskId !== 'string' || taskId.trim().length === 0) {
      throw createValidationError('taskId 不能为空');
    }
  }

  private isValidAspectRatio(aspectRatio: string): aspectRatio is MidjourneyAspectRatio {
    const validRatios: MidjourneyAspectRatio[] = [
      '1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2', '5:4', '4:5', '3:5', '5:3'
    ];
    return validRatios.includes(aspectRatio as MidjourneyAspectRatio);
  }

  private isValidVersion(version: string): version is MidjourneyVersion {
    const validVersions: MidjourneyVersion[] = ['7', '6.1', '6', 'niji6'];
    return validVersions.includes(version as MidjourneyVersion);
  }

  private isValidSpeed(speed: string): speed is MidjourneySpeed {
    const validSpeeds: MidjourneySpeed[] = ['relaxed', 'fast', 'turbo'];
    return validSpeeds.includes(speed as MidjourneySpeed);
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