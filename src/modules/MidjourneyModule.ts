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
  type MidjourneyTaskType,
} from "../types/modules/midjourney";

/**
 * Midjourney 图片生成模块
 */
export class MidjourneyModule extends BaseModule {
  /**
   * 基础生成方法 - 统一入口
   */
  private async generate(request: MidjourneyGenerateRequest): Promise<MidjourneyTaskGenerateResponse> {
    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      `/api/v1/mj/generate`,
      request
    );
  }

  /**
   * 文本生成图片
   */
  async generateTextToImage(
    prompt: string,
    options?: Omit<MidjourneyGenerateRequest, 'taskType' | 'prompt' | 'fileUrls'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    return this.generate({
      taskType: 'mj_txt2img',
      prompt,
      ...options,
    });
  }

  /**
   * 图片生成图片
   */
  async generateImageToImage(
    prompt: string,
    fileUrls: string[],
    options?: Omit<MidjourneyGenerateRequest, 'taskType' | 'prompt' | 'fileUrls'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    if (!fileUrls?.length) {
      throw createValidationError('fileUrls is required for image to image generation');
    }
    
    return this.generate({
      taskType: 'mj_img2img',
      prompt,
      fileUrls,
      ...options,
    });
  }

  /**
   * 风格参考生成
   */
  async generateStyleReference(
    prompt: string,
    fileUrls: string[],
    options?: Omit<MidjourneyGenerateRequest, 'taskType' | 'prompt' | 'fileUrls'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    if (!fileUrls?.length) {
      throw createValidationError('fileUrls is required for style reference generation');
    }
    
    return this.generate({
      taskType: 'mj_style_reference',
      prompt,
      fileUrls,
      ...options,
    });
  }

  /**
   * Omni 参考生成
   */
  async generateOmniReference(
    prompt: string,
    fileUrls: string[],
    ow: number,
    options?: Omit<MidjourneyGenerateRequest, 'taskType' | 'prompt' | 'fileUrls' | 'ow'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    if (!fileUrls?.length) {
      throw createValidationError('fileUrls is required for omni reference generation');
    }
    if (!ow || ow < 1 || ow > 1000) {
      throw createValidationError('ow parameter must be between 1 and 1000');
    }
    
    return this.generate({
      taskType: 'mj_omni_reference',
      prompt,
      fileUrls,
      ow,
      ...options,
    });
  }

  /**
   * 生成视频
   */
  async generateVideo(
    prompt: string,
    fileUrls: string[],
    motion: 'high' | 'low' = 'high',
    options?: Omit<MidjourneyGenerateRequest, 'taskType' | 'prompt' | 'fileUrls' | 'motion'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    if (!fileUrls?.length || fileUrls.length !== 1) {
      throw createValidationError('fileUrls must contain exactly one image URL for video generation');
    }
    
    return this.generate({
      taskType: 'mj_video',
      prompt,
      fileUrls,
      motion,
      ...options,
    });
  }

  /**
   * 生成高清视频
   */
  async generateVideoHD(
    prompt: string,
    fileUrls: string[],
    motion: 'high' | 'low' = 'high',
    options?: Omit<MidjourneyGenerateRequest, 'taskType' | 'prompt' | 'fileUrls' | 'motion'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    if (!fileUrls?.length || fileUrls.length !== 1) {
      throw createValidationError('fileUrls must contain exactly one image URL for HD video generation');
    }
    
    return this.generate({
      taskType: 'mj_video_hd',
      prompt,
      fileUrls,
      motion,
      ...options,
    });
  }

  /**
   * 扩展视频 - 手动模式
   */
  async extendVideoManual(
    taskId: string,
    index: number,
    prompt: string,
    options?: Omit<MidjourneyGenerateVideoExtendRequest, 'taskType' | 'taskId' | 'index' | 'prompt'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    if (!prompt) {
      throw createValidationError('prompt is required for manual video extension');
    }
    
    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      `/api/v1/mj/video-extend`,
      {
        taskType: 'mj_video_extend_manual',
        taskId,
        index,
        prompt,
        ...options,
      }
    );
  }

  /**
   * 扩展视频 - 自动模式
   */
  async extendVideoAuto(
    taskId: string,
    index: number,
    options?: Omit<MidjourneyGenerateVideoExtendRequest, 'taskType' | 'taskId' | 'index'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      `/api/v1/mj/video-extend`,
      {
        taskType: 'mj_video_extend_auto',
        taskId,
        index,
        ...options,
      }
    );
  }

  /**
   * 图片放大
   */
  async upscale(
    taskId: string,
    imageIndex: number,
    options?: Omit<MidjourneyUpscaleRequest, 'taskId' | 'imageIndex'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    if (imageIndex < 1 || imageIndex > 4) {
      throw createValidationError('imageIndex must be between 1 and 4');
    }
    
    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      `/api/v1/mj/upscale`,
      {
        taskId,
        imageIndex,
        ...options,
      }
    );
  }

  /**
   * 图片变体
   */
  async vary(
    taskId: string,
    imageIndex: number,
    options?: Omit<MidjourneyVaryRequest, 'taskId' | 'imageIndex'>
  ): Promise<MidjourneyTaskGenerateResponse> {
    if (imageIndex < 1 || imageIndex > 4) {
      throw createValidationError('imageIndex must be between 1 and 4');
    }
    
    return this.httpClient.post<MidjourneyTaskGenerateResponse>(
      `/api/v1/mj/vary`,
      {
        taskId,
        imageIndex,
        ...options,
      }
    );
  }

  /**
   * 查询任务状态
   */
  async getTaskDetails(taskId: string): Promise<MidjourneyTaskData> {
    if (!taskId) {
      throw createValidationError('taskId is required');
    }

    const response = await this.httpClient.get<{ data: MidjourneyTaskData }>(
      `/api/v1/mj/task-details`,
      { taskId }
    );

    return response.data;
  }

  /**
   * 验证回调数据
   */
  async verifyCallback(callbackData: unknown): Promise<MidjourneyTaskData> {
    const data = callbackData as MidjourneyCallbackData;
    if (!data?.taskId) {
      throw createValidationError('Invalid callback data: taskId is required');
    }
    return this.getTaskDetails(data.taskId);
  }
}