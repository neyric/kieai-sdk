/**
 * Flux Kontext API 相关类型定义
 */

/**
 * 支持的图片宽高比
 */
export type FluxAspectRatio =
  | "1:1" // 正方形
  | "16:9" // 宽屏 HD
  | "9:16" // 移动端竖屏
  | "4:3" // 标准显示屏
  | "3:4" // 杂志布局（竖版）
  | "21:9" // 超宽屏电影
  | "16:21"; // 超高移动端

/**
 * Flux 模型类型
 */
export type FluxModel =
  | "flux-kontext-pro" // 标准模型，平衡性能
  | "flux-kontext-max"; // 增强模型，用于复杂场景和高质量生成

/**
 * 输出图片格式
 */
export type FluxOutputFormat = "jpeg" | "png";

/**
 * 任务状态枚举
 */
export enum FluxTaskStatus {
  /** 生成中 */
  GENERATING = 0,
  /** 成功 */
  SUCCESS = 1,
  /** 创建任务失败 */
  CREATE_TASK_FAILED = 2,
  /** 生成失败（任务创建成功但生成失败） */
  GENERATE_FAILED = 3,
}

/**
 * Flux Kontext 生成请求参数
 */
export interface FluxKontextGenerateRequest {
  /** 文本描述（必需） */
  prompt: string;

  /**
   * 图片宽高比
   * @default "16:9"
   */
  aspectRatio?: FluxAspectRatio;

  /**
   * 使用的 Flux Kontext 模型
   * @default 'flux-kontext-pro'
   * */
  model?: FluxModel;

  /**
   * 输出格式
   * @default "jpeg"
   *  */
  outputFormat?: FluxOutputFormat;

  /** 输入图片 URL（用于图片编辑模式） */
  inputImage?: string;

  /**
   * 是否启用翻译（自动翻译非英文提示词）
   * @default true
   *  */
  enableTranslation?: boolean;

  /**
   * 提示词增强（AI 优化提示词）
   * @default false
   */
  promptUpsampling?: boolean;

  /**
   * 内容安全容忍度。生成模式：0-6，编辑模式：0-2
   * @default 2 */
  safetyTolerance?: number;

  /** 回调 URL */
  callBackUrl?: string;

  /** 是否使用中国服务器上传，默认 false */
  uploadCn?: boolean;

  /**
   * 要添加到生成图像的水印标识符。
   * 如果提供，将在输出图像上添加水印
   *  */
  watermark?: string;
}

/**
 * Flux Kontext 生成响应
 */
export interface FluxKontextGenerateResponse {
  taskId: string;
}

/**
 * 任务完成后的响应结果
 */
export interface FluxTaskResponse {
  /** 生成的结果图片 URL */
  resultImageUrl: string;

  /** 原始图片 URL（有效期 10 分钟） */
  originImageUrl: string;
}

/**
 * 任务详情响应中的任务数据
 */
export interface FluxTaskData {
  /** 任务 ID */
  taskId: string;

  /** 参数 JSON 字符串 */
  paramJson: string;

  /** 完成时间 */
  completeTime: number | null;

  /** 响应结果 */
  response: FluxTaskResponse | null;

  /** 任务状态标志 */
  successFlag: FluxTaskStatus;

  /** 错误代码 */
  errorCode: number | null;

  /** 错误消息 */
  errorMessage: string | null;

  /** 创建时间 */
  createTime: number;
}

/**
 * 任务状态查询响应
 */
export type FluxTaskDetailsResponse = FluxTaskData;

/**
 * 回调响应数据结构
 */
export interface FluxCallbackData {
  taskId: string;
  info: FluxTaskResponse;
}

/**
 * 图片生成选项（文本生成图片）
 */
export type FluxGenerateOptions = FluxKontextGenerateRequest

/**
 * 图片编辑选项
 */
export type FluxEditOptions = FluxKontextGenerateRequest & {
  /** 输入图片 URL（必需） */
  inputImage: string;
};
