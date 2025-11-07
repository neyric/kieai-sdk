/**
 * Midjourney 插件 API 接口定义
 */

/**
 * 支持的图片宽高比
 */
export type MidjourneyAspectRatio =
  | "1:2"
  | "9:16"
  | "2:3"
  | "3:4"
  | "5:6"
  | "6:5"
  | "4:3"
  | "3:2"
  | "1:1"
  | "16:9"
  | "2:1";

/**
 * Midjourney 模型版本
 */
export type MidjourneyVersion = "7" | "6.1" | "6" | "5.2" | "5.1" | "niji6";

/**
 * 生成速度选项
 */
export type MidjourneySpeed = "relaxed" | "fast" | "turbo";

/**
 * 任务类型
 */
export type MidjourneyTaskType =
  | "mj_txt2img"
  | "mj_img2img"
  | "mj_style_reference"
  | "mj_omni_reference"
  | "mj_video"
  | "mj_video_hd";

/**
 * 视频运动水平
 */
export type MidjourneyMotion = "high" | "low";

/**
 * 文本生成图片选项
 */
export interface TextToImageOptions {
  /** 文本描述 */
  prompt: string;
  /** 生成速度 */
  speed?: MidjourneySpeed;
  /** 宽高比 */
  aspectRatio?: MidjourneyAspectRatio;
  /** 模型版本 */
  version?: MidjourneyVersion;
  /** 多样性 (0, 5, 10, ...) */
  variety?: number;
  /** 风格化强度 (0-1000) */
  stylization?: number;
  /** 古怪性 (0-3000) */
  weirdness?: number;
  /** 水印标识符 */
  watermark?: string;
  /** 是否启用自动翻译 */
  enableTranslation?: boolean;
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 图片生成图片选项
 */
export interface ImageToImageOptions extends TextToImageOptions {
  /** 输入图片 URL 数组 */
  fileUrls: string[];
}

/**
 * 图片放大选项
 */
export interface UpscaleOptions {
  /** 原始任务 ID */
  taskId: string;
  /** 要放大的图片索引 (1-4) */
  imageIndex: number;
  /** 水印标识 */
  waterMark?: string;
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 图片变体选项
 */
export interface VaryOptions {
  /** 原始任务 ID */
  taskId: string;
  /** 图片索引 (1-4) */
  imageIndex: number;
  /** 水印标识 */
  waterMark?: string;
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 生成响应
 */
export interface GenerateResponse {
  /** 任务 ID */
  taskId: string;
}

/**
 * 任务状态
 */
export enum TaskStatus {
  /** 生成中 */
  GENERATING = 0,
  /** 成功 */
  SUCCESS = 1,
  /** 任务失败 */
  TASK_FAILED = 2,
  /** 生成失败 */
  GENERATE_FAILED = 3,
}

/**
 * 生成结果
 */
export interface GenerateResult {
  resultUrls: { resultUrl: string }[];
}

/**
 * 任务详情
 */
export interface TaskDetails {
  /** 任务 ID */
  taskId: string;
  /** 任务类型 */
  taskType: MidjourneyTaskType;
  /** 参数 JSON */
  paramJson: string;
  /** 完成时间 */
  completeTime: string | null;
  /** 结果信息 */
  resultInfoJson: GenerateResult | null;
  /** 任务状态 */
  successFlag: TaskStatus;
  /** 错误代码 */
  errorCode: number | null;
  /** 错误消息 */
  errorMessage: string | null;
  /** 创建时间 */
  createTime: string;
}

/**
 * Midjourney 插件 API 接口
 */
export interface MidjourneyAPI {
  /**
   * 文本生成图片
   */
  generateTextToImage(options: TextToImageOptions): Promise<GenerateResponse>;

  /**
   * 图片生成图片
   */
  generateImageToImage(options: ImageToImageOptions): Promise<GenerateResponse>;

  /**
   * 图片放大
   */
  upscale(options: UpscaleOptions): Promise<GenerateResponse>;

  /**
   * 图片变体
   */
  vary(options: VaryOptions): Promise<GenerateResponse>;

  /**
   * 查询任务详情
   */
  getTaskDetails(taskId: string): Promise<TaskDetails>;
}
