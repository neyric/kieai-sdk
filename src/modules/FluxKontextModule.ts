import { BaseModule } from "../core/BaseModule";
import { createValidationError } from "../types/errors";
import {
  type FluxKontextGenerateRequest,
  type FluxKontextGenerateResponse,
  type FluxTaskDetailsResponse,
  type FluxGenerateOptions,
  type FluxEditOptions,
  type FluxTaskData,
} from "../types/modules/flux-kontext";

/**
 * Flux Kontext 图片生成模块
 */
export class FluxKontextModule extends BaseModule {
  async generate(options: FluxKontextGenerateRequest) {
    const response = await this.httpClient.post<FluxKontextGenerateResponse>(
      `/api/v1/flux/kontext/generate`,
      options
    );

    return response;
  }

  /**
   * 生成图片
   * @param options 生成选项
   * @returns 生成响应
   */
  async generateImage(options: FluxGenerateOptions) {
    const response = await this.generate(options);
    return response;
  }

  /**
   * 编辑图片
   * @param options 编辑选项
   * @returns 生成响应
   */
  async editImage(options: FluxEditOptions) {
    const response = await this.generate(options);
    return response;
  }

  /**
   * 获取任务状态
   * @param taskId 任务ID
   * @returns 任务详情
   */
  async getTaskStatus(taskId: string): Promise<FluxTaskData> {
    if (!taskId) {
      throw createValidationError("taskId is required");
    }

    const response = await this.httpClient.get<FluxTaskDetailsResponse>(
      `/api/v1/flux/kontext/record-info`,
      { taskId }
    );

    return response;
  }
}
