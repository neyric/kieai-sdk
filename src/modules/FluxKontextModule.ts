import { BaseModule } from '../core/BaseModule';
import { KieError, createValidationError, createApiError } from '../types/errors';
import {
  FluxTaskStatus,
  type FluxKontextGenerateRequest,
  type FluxKontextGenerateResponse,
  type FluxTaskDetailsResponse,
  type FluxGenerateOptions,
  type FluxEditOptions,
  type FluxWaitForCompletionOptions,
  type FluxTaskData,
  type FluxTaskResponse,
  type FluxAspectRatio,
  type FluxModel,
  type FluxOutputFormat,
} from '../types/modules/flux-kontext';

/**
 * Flux Kontext 图片生成模块
 * 基于 Flux Kontext API 实现文本生成图片和图片编辑功能
 */
export class FluxKontextModule extends BaseModule {
  private readonly apiPath = '/api/v1/flux/kontext';

  /**
   * 文本生成图片
   * @param options 生成选项
   * @returns 任务ID
   */
  async generateImage(options: FluxGenerateOptions): Promise<string> {
    this.validateGenerateOptions(options);

    const request: FluxKontextGenerateRequest = {
      prompt: options.prompt,
      aspectRatio: options.aspectRatio || '16:9',
      model: options.model || 'flux-kontext-pro',
      outputFormat: options.outputFormat || 'jpeg',
      enableTranslation: options.enableTranslation !== false,
      promptUpsampling: options.promptUpsampling || false,
      safetyTolerance: options.safetyTolerance || 2,
      callBackUrl: options.callBackUrl,
      uploadCn: options.uploadCn || false,
      watermark: options.watermark,
    };

    const response = await this.httpClient.post<FluxKontextGenerateResponse>(
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
  async editImage(options: FluxEditOptions): Promise<string> {
    this.validateEditOptions(options);

    const request: FluxKontextGenerateRequest = {
      prompt: options.prompt,
      inputImage: options.inputImage,
      aspectRatio: options.aspectRatio || '16:9',
      model: options.model || 'flux-kontext-pro',
      outputFormat: options.outputFormat || 'jpeg',
      enableTranslation: options.enableTranslation !== false,
      promptUpsampling: options.promptUpsampling || false,
      safetyTolerance: options.safetyTolerance || 2,
      callBackUrl: options.callBackUrl,
      uploadCn: options.uploadCn || false,
      watermark: options.watermark,
    };

    const response = await this.httpClient.post<FluxKontextGenerateResponse>(
      `${this.apiPath}/generate`,
      request
    );

    this.handleApiResponse(response, '图片编辑失败');
    return response.data.taskId;
  }

  /**
   * 查询任务状态
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskDetails(taskId: string): Promise<FluxTaskData> {
    this.validateTaskId(taskId);

    const response = await this.httpClient.get<FluxTaskDetailsResponse>(
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
    options?: FluxWaitForCompletionOptions
  ): Promise<FluxTaskResponse> {
    const {
      maxWaitTime = 300000, // 5分钟
      pollInterval = 3000,  // 3秒
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
        case FluxTaskStatus.SUCCESS:
          if (!taskData.response) {
            throw new Error('任务完成但没有返回结果数据');
          }
          return taskData.response;

        case FluxTaskStatus.CREATE_TASK_FAILED:
          const createError = taskData.errorMessage || '创建任务失败';
          const createErrorDetails = taskData.errorCode ? ` (错误代码: ${taskData.errorCode})` : '';
          throw createApiError('CREATE_TASK_FAILED', createError + createErrorDetails);

        case FluxTaskStatus.GENERATE_FAILED:
          const generateError = taskData.errorMessage || '图片生成失败';
          const generateErrorDetails = taskData.errorCode ? ` (错误代码: ${taskData.errorCode})` : '';
          throw createApiError('GENERATE_FAILED', generateError + generateErrorDetails);

        case FluxTaskStatus.GENERATING:
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
   * @returns 生成结果
   */
  async generateAndWait(
    options: FluxGenerateOptions,
    waitOptions?: FluxWaitForCompletionOptions
  ): Promise<FluxTaskResponse> {
    const taskId = await this.generateImage(options);
    return this.waitForCompletion(taskId, waitOptions);
  }

  /**
   * 一键编辑并等待完成（便捷方法）
   * @param options 编辑选项
   * @param waitOptions 等待选项
   * @returns 编辑结果
   */
  async editAndWait(
    options: FluxEditOptions,
    waitOptions?: FluxWaitForCompletionOptions
  ): Promise<FluxTaskResponse> {
    const taskId = await this.editImage(options);
    return this.waitForCompletion(taskId, waitOptions);
  }

  // 私有方法：统一处理API响应
  private handleApiResponse(response: { code: number; msg: string }, errorContext: string): void {
    if (response.code !== 200) {
      throw createApiError(response.code.toString(), `${errorContext}: ${response.msg}`);
    }
  }

  // 私有验证方法

  private validateGenerateOptions(options: FluxGenerateOptions): void {
    const requiredFields = ['prompt'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (options.prompt.length === 0) {
      throw createValidationError('prompt 不能为空');
    }

    if (options.aspectRatio && !this.isValidAspectRatio(options.aspectRatio)) {
      throw createValidationError('aspectRatio 必须是有效的宽高比格式，如: "1:1", "16:9", "9:16" 等');
    }

    if (options.model && !this.isValidModel(options.model)) {
      throw createValidationError('model 必须是 "flux-kontext-pro" 或 "flux-kontext-max"');
    }

    if (options.outputFormat && !this.isValidOutputFormat(options.outputFormat)) {
      throw createValidationError('outputFormat 必须是 "jpeg" 或 "png"');
    }

    if (options.safetyTolerance !== undefined) {
      if (!Number.isInteger(options.safetyTolerance) || options.safetyTolerance < 0 || options.safetyTolerance > 6) {
        throw createValidationError('safetyTolerance 必须是 0-6 之间的整数（生成模式）');
      }
    }

    if (options.callBackUrl && !this.isValidUrl(options.callBackUrl)) {
      throw createValidationError('callBackUrl 不是有效的 URL');
    }
  }

  private validateEditOptions(options: FluxEditOptions): void {
    // 先验证基础生成选项
    this.validateGenerateOptions(options);

    // 验证编辑特有的参数
    const requiredFields = ['inputImage'];
    this.validateParams(options as Record<string, any>, requiredFields);

    if (!this.isValidUrl(options.inputImage)) {
      throw createValidationError('inputImage 不是有效的 URL');
    }

    // 编辑模式下 safetyTolerance 范围是 0-2
    if (options.safetyTolerance !== undefined) {
      if (!Number.isInteger(options.safetyTolerance) || options.safetyTolerance < 0 || options.safetyTolerance > 2) {
        throw createValidationError('safetyTolerance 必须是 0-2 之间的整数（编辑模式）');
      }
    }
  }

  private validateTaskId(taskId: string): void {
    if (!taskId || typeof taskId !== 'string' || taskId.trim().length === 0) {
      throw createValidationError('taskId 不能为空');
    }
  }

  private isValidAspectRatio(aspectRatio: string): aspectRatio is FluxAspectRatio {
    const validRatios: FluxAspectRatio[] = [
      '1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '16:21'
    ];
    return validRatios.includes(aspectRatio as FluxAspectRatio);
  }

  private isValidModel(model: string): model is FluxModel {
    return model === 'flux-kontext-pro' || model === 'flux-kontext-max';
  }

  private isValidOutputFormat(format: string): format is FluxOutputFormat {
    return format === 'jpeg' || format === 'png';
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