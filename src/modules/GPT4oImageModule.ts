import { BaseModule } from "../core/BaseModule";
import { createValidationError } from "../types/errors";
import {
  type GenerateImageOptions,
  type EditImageOptions,
  type GeneratorGPT4oImageOptions,
  type GeneratorGPT4oImageResponse,
  type TaskData,
  type TaskDetailsResponse,
  type DownloadUrlRequest,
  type DownloadUrlResponse,
} from "../types/modules/gpt-image";

/**
 * GPT-4o 图片生成模块
 */
export class GPT4oImageModule extends BaseModule {
  protected readonly apiPath = "/api/v1/gpt4o-image";

  async generate(options: GeneratorGPT4oImageOptions) {
    const response = await this.httpClient.post<GeneratorGPT4oImageResponse>(
      `/api/v1/gpt4o-image/generate`,
      options
    );

    return response;
  }

  /**
   * 生成图片
   * @param options 生成选项
   * @returns 任务ID
   */
  async generateImage(options: GenerateImageOptions) {
    const response = await this.generate(options);
    return response;
  }

  /**
   * 编辑图片
   * @param options 编辑选项
   * @returns 任务ID
   */
  async editImage({ fileUrl, maskUrl, ...rest }: EditImageOptions) {
    const response = await this.generate({
      ...rest,
      maskUrl,
      filesUrl: [fileUrl],
    });

    return response;
  }

  /**
   * 获取任务状态
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskStatus(taskId: string): Promise<TaskData> {
    if (!taskId) {
      throw createValidationError("taskId is required");
    }

    const response = await this.httpClient.get<TaskDetailsResponse>(
      `/api/v1/gpt4o-image/record-info`,
      { taskId }
    );

    return response;
  }

  /**
   * 获取图片下载链接
   * @param imageUrl 图片URL
   * @returns 下载链接
   */
  async getDownloadUrl(imageUrl: string) {
    if (!imageUrl) {
      throw createValidationError("imageUrl is required");
    }

    const request: DownloadUrlRequest = { imageUrl };

    const response = await this.httpClient.post<DownloadUrlResponse>(
      `/api/v1/gpt4o-image/download-url`,
      request
    );

    return response;
  }
}
