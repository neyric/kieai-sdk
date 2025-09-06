import { BaseModule } from '../core/BaseModule';
import { createValidationError, createApiError } from '../types/errors';
import {
  TaskStatusCode,
  type GPTImageGenerateRequest,
  type GPTImageGenerateResponse,
  type TaskDetailsResponse,
  type DownloadUrlRequest,
  type DownloadUrlResponse,
  type GPTImageOptions,
  type ImageEditOptions,
  type ImageVariantOptions,
  type WaitForCompletionOptions,
  type TaskData,
  type ImageSize,
} from '../types/modules/gpt-image';

/**
 * GPT-4o 图片生成模块
 */
export class GPT4oImageModule extends BaseModule {
  private readonly apiPath = '/api/v1/gpt4o-image';

  /**
   * 文本生成图片
   * @param options 生成选项
   * @returns 任务ID
   */
  async generateImage(options: GPTImageOptions): Promise<string> {
    this.validateTextToImageOptions(options);

    const request: GPTImageGenerateRequest = {
      prompt: options.prompt,
      size: options.size || '1:1',
      nVariants: options.nVariants || 1,
      isEnhance: options.isEnhance || false,
      enableFallback: options.enableFallback || false,
    };

    const response = await this.httpClient.post<GPTImageGenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );

    this.handleApiResponse(response, '图片生成失败');
    return response.data.taskId;
  }

  /**
   * 图片编辑
   * @param options 编辑选项
   * @returns 任务ID
   */
  async editImage(options: ImageEditOptions): Promise<string> {
    this.validateImageEditOptions(options);

    const request: GPTImageGenerateRequest = {
      prompt: options.prompt,
      size: options.size || '1:1',
      filesUrl: options.filesUrl,
      maskUrl: options.maskUrl,
      nVariants: options.nVariants || 1,
    };

    const response = await this.httpClient.post<GPTImageGenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );

    this.handleApiResponse(response, '图片编辑失败');
    return response.data.taskId;
  }

  /**
   * 生成图片变体
   * @param options 变体选项
   * @returns 任务ID
   */
  async createVariants(options: ImageVariantOptions): Promise<string> {
    this.validateImageVariantOptions(options);

    const request: GPTImageGenerateRequest = {
      prompt: options.prompt,
      size: options.size || '1:1',
      filesUrl: options.filesUrl,
      nVariants: options.nVariants || 1,
    };

    const response = await this.httpClient.post<GPTImageGenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );

    this.handleApiResponse(response, '图片变体生成失败');
    return response.data.taskId;
  }

  /**
   * 查询任务状态
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskDetails(taskId: string): Promise<TaskData> {
    this.validateTaskId(taskId);

    const response = await this.httpClient.get<TaskDetailsResponse>(
      `${this.apiPath}/record-info`,
      { taskId }
    );

    this.handleApiResponse(response, '任务状态查询失败');
    return response.data;
  }

  /**
   * 获取图片下载URL
   * @param imageUrl 图片URL
   * @returns 下载URL
   */
  async getDownloadUrl(imageUrl: string): Promise<string> {
    this.validateImageUrl(imageUrl);

    const request: DownloadUrlRequest = { imageUrl };

    const response = await this.httpClient.post<DownloadUrlResponse>(
      `${this.apiPath}/download-url`,
      request
    );

    this.handleApiResponse(response, '获取下载URL失败');
    return response.data.downloadUrl;
  }

  /**
   * 等待任务完成
   * @param taskId 任务ID
   * @param options 等待选项
   * @returns 生成结果
   */
  async waitForCompletion(
    taskId: string,
    options?: WaitForCompletionOptions
  ): Promise<{ result_urls: string[] }> {
    const {
      maxWaitTime = 300000, // 5分钟
      pollInterval = 10000,  // 10秒
      onProgress,
    } = options || {};

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const taskData = await this.getTaskDetails(taskId);

      // 调用进度回调
      if (onProgress && taskData.progress) {
        const progress = parseFloat(taskData.progress);
        onProgress(progress, taskData);
      }

      switch (taskData.successFlag) {
        case TaskStatusCode.SUCCESS:
          if (!taskData.response?.result_urls) {
            throw new Error('任务完成但没有返回图片URL');
          }
          return taskData.response;

        case TaskStatusCode.FAILED:
          const errorMsg = taskData.errorMessage || '图片生成失败';
          throw new Error(errorMsg);

        case TaskStatusCode.GENERATING:
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
   * 一键生成并等待完成（便捷方法）
   * @param options 生成选项
   * @param waitOptions 等待选项
   * @returns 图片URL列表
   */
  async generateAndWait(
    options: GPTImageOptions,
    waitOptions?: WaitForCompletionOptions
  ): Promise<string[]> {
    const taskId = await this.generateImage(options);
    const result = await this.waitForCompletion(taskId, waitOptions);
    return result.result_urls;
  }

  /**
   * 一键编辑并等待完成（便捷方法）
   * @param options 编辑选项
   * @param waitOptions 等待选项
   * @returns 图片URL列表
   */
  async editAndWait(
    options: ImageEditOptions,
    waitOptions?: WaitForCompletionOptions
  ): Promise<string[]> {
    const taskId = await this.editImage(options);
    const result = await this.waitForCompletion(taskId, waitOptions);
    return result.result_urls;
  }

  /**
   * 一键生成变体并等待完成（便捷方法）
   * @param options 变体选项
   * @param waitOptions 等待选项
   * @returns 图片URL列表
   */
  async createVariantsAndWait(
    options: ImageVariantOptions,
    waitOptions?: WaitForCompletionOptions
  ): Promise<string[]> {
    const taskId = await this.createVariants(options);
    const result = await this.waitForCompletion(taskId, waitOptions);
    return result.result_urls;
  }

  // 私有方法：统一处理API响应
  private handleApiResponse(response: { code: number; msg: string }, errorContext: string): void {
    if (response.code !== 200) {
      throw createApiError(response.code.toString(), `${errorContext}: ${response.msg}`);
    }
  }

  // 私有验证方法

  private validateTextToImageOptions(options: GPTImageOptions): void {
    const requiredFields = ['prompt'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (options.prompt.length > 2000) {
      throw createValidationError('prompt 长度不能超过2000个字符');
    }

    if (options.size && !this.isValidImageSize(options.size)) {
      throw createValidationError('size 必须是 "1:1", "3:2" 或 "2:3"');
    }

    if (options.nVariants && ![1, 2, 4].includes(options.nVariants)) {
      throw createValidationError('nVariants 必须是 1, 2 或 4');
    }
  }

  private validateImageEditOptions(options: ImageEditOptions): void {
    const requiredFields = ['filesUrl', 'prompt'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (!Array.isArray(options.filesUrl) || options.filesUrl.length === 0) {
      throw createValidationError('filesUrl 必须是非空数组');
    }

    if (options.filesUrl.length > 5) {
      throw createValidationError('filesUrl 最多支持5张图片');
    }

    // 验证URL格式
    options.filesUrl.forEach((url, index) => {
      if (!this.isValidUrl(url)) {
        throw createValidationError(`filesUrl[${index}] 不是有效的URL`);
      }
    });

    if (options.maskUrl && !this.isValidUrl(options.maskUrl)) {
      throw createValidationError('maskUrl 不是有效的URL');
    }

    if (options.prompt.length > 2000) {
      throw createValidationError('prompt 长度不能超过2000个字符');
    }

    if (options.size && !this.isValidImageSize(options.size)) {
      throw createValidationError('size 必须是 "1:1", "3:2" 或 "2:3"');
    }

    if (options.nVariants && ![1, 2, 4].includes(options.nVariants)) {
      throw createValidationError('nVariants 必须是 1, 2 或 4');
    }
  }

  private validateImageVariantOptions(options: ImageVariantOptions): void {
    const requiredFields = ['filesUrl', 'prompt'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (!Array.isArray(options.filesUrl) || options.filesUrl.length === 0) {
      throw createValidationError('filesUrl 必须是非空数组');
    }

    if (options.filesUrl.length > 5) {
      throw createValidationError('filesUrl 最多支持5张图片');
    }

    // 验证URL格式
    options.filesUrl.forEach((url, index) => {
      if (!this.isValidUrl(url)) {
        throw createValidationError(`filesUrl[${index}] 不是有效的URL`);
      }
    });

    if (options.prompt.length > 2000) {
      throw createValidationError('prompt 长度不能超过2000个字符');
    }

    if (options.size && !this.isValidImageSize(options.size)) {
      throw createValidationError('size 必须是 "1:1", "3:2" 或 "2:3"');
    }

    if (options.nVariants && ![1, 2, 4].includes(options.nVariants)) {
      throw createValidationError('nVariants 必须是 1, 2 或 4');
    }
  }

  private validateTaskId(taskId: string): void {
    if (!taskId || typeof taskId !== 'string' || taskId.trim().length === 0) {
      throw createValidationError('taskId 不能为空');
    }
  }

  private validateImageUrl(imageUrl: string): void {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      throw createValidationError('imageUrl 不能为空');
    }

    if (!this.isValidUrl(imageUrl)) {
      throw createValidationError('imageUrl 不是有效的URL');
    }
  }

  private isValidImageSize(size: string): size is ImageSize {
    return ['1:1', '3:2', '2:3'].includes(size);
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