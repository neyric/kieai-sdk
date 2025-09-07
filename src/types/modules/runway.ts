/**
 * Runway API 相关类型定义
 */

import type { APIResponse } from "../common";

/**
 * 支持的视频宽高比
 */
export type RunwayAspectRatio =
  | "16:9" // 宽屏 HD（推荐）
  | "9:16" // 移动端竖屏
  | "1:1" // 正方形
  | "4:3" // 传统显示屏
  | "3:4"; // 竖版

/**
 * 视频质量设置
 */
export type RunwayVideoQuality =
  | "720p" // HD 高清（兼容 5秒和10秒）
  | "1080p"; // Full HD 全高清（仅支持5秒）

/**
 * 视频时长（秒）
 */
export type RunwayVideoDuration = 5 | 10;

/**
 * 任务状态
 */
export type RunwayTaskState =
  | "wait" // 等待中
  | "queueing" // 排队中
  | "generating" // 生成中
  | "success" // 成功
  | "fail"; // 失败

/**
 * 基础生成请求参数
 */
export interface RunwayBaseGenerateRequest {
  /** 文本描述（必需） */
  prompt: string;

  /**
   * 视频时长，可选值为5或10。如果选10秒视频，则无法使用1080p分辨率
   */
  duration: RunwayVideoDuration;

  /** 视频分辨率，可选值为720p或1080p。如果选择了1080p，则无法生成10秒的视频 */
  quality: RunwayVideoQuality;

  /** 视频宽高比参数。所有视频生成请求的必填参数。 */
  aspectRatio: RunwayAspectRatio;

  /** 可选的参考图像URL，作为视频的基础。提供后，AI将创建一个为此图像添加动画或扩展的视频。 */
  imageUrl?: string;

  /**
   * 视频水印文本内容。
   * 空字符串表示不添加水印，非空字符串将在视频右下角显示指定的水印文本。
   * */
  waterMark?: string;

  /** 回调 URL */
  callBackUrl?: string;
}

/** 文本转视频请求参数 */
export type RunwayTextToVideoOptions = Omit<
  RunwayBaseGenerateRequest,
  "imageUrl"
>;

/** 图片转视频请求参数 */
export type RunwayImageToVideoOptions = RunwayBaseGenerateRequest & {
  /** 输入图片 URL（必需） */
  imageUrl: string;
};

/**
 * 视频扩展请求参数
 */
export interface RunwayExtendVideoRequest {
  /** 原始视频生成任务的唯一标识符。必须是来自先前生成视频的有效任务ID。 */
  taskId: string;

  /** 指导视频续集的描述性文本。解释接下来应该发生什么动作、动态或发展。要具体但保持与原始视频内容的一致性。 */
  prompt: string;

  /** 视频分辨率，可选值为720p或1080p */
  quality?: RunwayVideoQuality;

  /** 视频水印文本内容。空字符串表示不添加水印，非空字符串将在视频右下角显示指定的水印文本。 */
  watermark?: string;

  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 生成响应
 */
export interface RunwayGenerateResponse {
  taskId: string;
}

/** 视频信息 */
export interface RunwayVideoResult {
  task_id: string;
  video_id: string;
  video_url: string;
  image_url: string;
}

/**
 * 任务详情数据
 */
export interface RunwayTaskData {
  /** 任务 ID */
  taskId: string;
  /** 仅适用于延长任务 - 被延长的原始视频的任务ID。标准生成任务时为空 */
  parentTaskId?: string;
  /** 用于视频生成或延长的参数 */
  generateParam?: {
    /** 用于引导AI视频生成的文本提示词 */
    prompt: string;
    /** 用于视频生成的参考图像URL或视频延长开始的帧图像URL */
    imageUrl: string;
    /** 生成过程中是否使用了AI提示词增强功能 */
    expandPrompt: boolean;
  };
  /** 任务状态 */
  state: RunwayTaskState;
  /** 视频生成完成的时间戳 */
  generateTime?: string;
  /** 生成的视频详情，仅当状态为'success'时可用 */
  videoInfo?: RunwayVideoResult;
  /** 指示视频是否已过期：0 = 有效（仍可使用），1 = 已过期（不再可用） */
  expireFlag: 0 | 1;
  /** 错误码 */
  failCode?: number;
  /** 失败消息（失败时才有） */
  failMsg?: string;
}

type RunwayAlephAspectRatio = RunwayAspectRatio & "21:9";

/**
 * Runway Aleph 视频生成请求参数
 */
export interface RunwayAlephGenerateOptions {
  /**
   * 指导 AI 视频转换的描述性文本。请具体描述主题、动作、风格和设置。描述如何根据提示词对参考视频内容进行转换或修改。
   *
   * **最佳实践：**
   * - 专注于转换和风格变化，而不是描述视频中已有的内容
   * - 包含镜头运动描述（例如：“缓慢放大”、“轨道旋转”）
   * - 添加时间元素（例如：“逐渐地”、“平滑地”、“突然地”）
   * - 如有需要，指定照明和氛围变化
   *
   * @example "转换为梦幻水彩画风格，配以柔和流动的运动效果"
   * */
  prompt: string;

  /**
   * 用作视频生成基础的参考视频 URL。AI 将根据提示词对该视频进行转换和增强。
   * - 最大文件大小：10MB
   * - 必须通过 HTTPS 访问
   *  */
  videoUrl: string;

  /** 接收 AI 视频生成任务完成更新的 URL。当视频生成完成时，系统将向此 URL 发送 POST 请求，包含任务状态和结果 */
  callBackUrl?: string;

  /** 可选的水印文本内容。空字符串表示无水印，非空字符串将在视频中显示指定文本作为水印。 */
  waterMark?: string;

  /** 上传方式选择。默认值为 false（S3/R2），设置为 true 使用阿里云 OSS 上传，设置为 false 使用海外 R2 服务器上传。 */
  uploadCn?: boolean;

  /** 视频纵横比 */
  aspectRatio?: RunwayAlephAspectRatio;

  /** 随机种子。用于结果可复现。 */
  seed?: number;

  /** 参考图像 URL，用于影响输出的风格或内容。 */
  referenceImage?: string;
}

/**
 * Runway Aleph 视频生成响应
 */
export interface RunwayAlephGenerateResponse {
  /** 生成任务的唯一标识符，可与 `获取 Aleph 视频详情` 一起使用来查询任务状态 */
  taskId: string;
}

export interface RunwayAlephGenerateResponse {
  taskId: string;
  resultVideoUrl: string;
  resultImageUrl: string;
}

export type RunwayAlephCallbackData = APIResponse<{
  result_video_url: string;
  result_image_url: string;
}> & { taskId: string };

export interface RunwayAlephGenerateResult {
  taskId: string;
  paramJson: string;
  response: RunwayAlephGenerateResponse | null;
  completeTime: string | null;
  createTime: string;
  /**
   * 成功状态指示符：1：视频生成成功 / 0：生成失败或仍在进行中
   */
  successFlag: 0 | 1;
  /** 生成失败时的错误码（成功时为 0） */
  errorCode: number;
  /** 解释失败原因的详细错误消息（成功时为空） */
  errorMessage: string;
}
