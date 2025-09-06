/**
 * Flux Kontext API 相关类型定义
 */

/**
 * 支持的图片宽高比
 */
export type FluxAspectRatio = 
  | '1:1'      // 正方形
  | '16:9'     // 宽屏 HD
  | '9:16'     // 移动端竖屏
  | '4:3'      // 标准显示屏
  | '3:4'      // 杂志布局（竖版）
  | '21:9'     // 超宽屏电影
  | '16:21';   // 超高移动端

/**
 * Flux 模型类型
 */
export type FluxModel = 
  | 'flux-kontext-pro'  // 标准模型，平衡性能
  | 'flux-kontext-max'; // 增强模型，用于复杂场景和高质量生成

/**
 * 输出图片格式
 */
export type FluxOutputFormat = 'jpeg' | 'png';

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
  GENERATE_FAILED = 3
}

/**
 * Flux Kontext 生成请求参数
 */
export interface FluxKontextGenerateRequest {
  /** 文本描述（必需） */
  prompt: string;
  
  /** 图片宽高比，默认 '16:9' */
  aspectRatio?: FluxAspectRatio;
  
  /** 模型选择，默认 'flux-kontext-pro' */
  model?: FluxModel;
  
  /** 输出格式，默认 'jpeg' */
  outputFormat?: FluxOutputFormat;
  
  /** 输入图片 URL（用于图片编辑模式） */
  inputImage?: string;
  
  /** 是否启用翻译（自动翻译非英文提示词），默认 true */
  enableTranslation?: boolean;
  
  /** 提示词增强（AI 优化提示词），默认 false */
  promptUpsampling?: boolean;
  
  /** 内容安全容忍度。生成模式：0-6，编辑模式：0-2，默认 2 */
  safetyTolerance?: number;
  
  /** 回调 URL */
  callBackUrl?: string;
  
  /** 是否使用中国服务器上传，默认 false */
  uploadCn?: boolean;
  
  /** 水印标识符 */
  watermark?: string;
}

/**
 * Flux Kontext 生成响应
 */
export interface FluxKontextGenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
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
  completeTime: string | null;
  
  /** 响应结果 */
  response: FluxTaskResponse | null;
  
  /** 任务状态标志 */
  successFlag: FluxTaskStatus;
  
  /** 错误代码 */
  errorCode: number | null;
  
  /** 错误消息 */
  errorMessage: string | null;
  
  /** 创建时间 */
  createTime: string;
  
  /** 进度百分比（如果支持） */
  progress?: string | null;
}

/**
 * 任务状态查询响应
 */
export interface FluxTaskDetailsResponse {
  code: number;
  msg: string;
  data: FluxTaskData;
}

/**
 * 回调响应数据结构
 */
export interface FluxCallbackData {
  code: number;
  msg: string;
  data: {
    info: FluxTaskResponse;
  };
}

/**
 * Flux 图片生成选项（简化版本，用于用户接口）
 */
export interface FluxGenerateOptions {
  /** 文本描述 */
  prompt: string;
  
  /** 图片宽高比，默认 '16:9' */
  aspectRatio?: FluxAspectRatio;
  
  /** 模型选择，默认 'flux-kontext-pro' */
  model?: FluxModel;
  
  /** 输出格式，默认 'jpeg' */
  outputFormat?: FluxOutputFormat;
  
  /** 是否启用翻译，默认 true */
  enableTranslation?: boolean;
  
  /** 提示词增强，默认 false */
  promptUpsampling?: boolean;
  
  /** 内容安全容忍度，默认 2 */
  safetyTolerance?: number;
  
  /** 回调 URL */
  callBackUrl?: string;
  
  /** 是否使用中国服务器上传，默认 false */
  uploadCn?: boolean;
  
  /** 水印标识符 */
  watermark?: string;
}

/**
 * Flux 图片编辑选项
 */
export interface FluxEditOptions extends FluxGenerateOptions {
  /** 输入图片 URL（必需） */
  inputImage: string;
}

/**
 * 等待完成选项
 */
export interface FluxWaitForCompletionOptions {
  /** 最大等待时间（毫秒），默认 300000 (5分钟) */
  maxWaitTime?: number;
  
  /** 轮询间隔（毫秒），默认 3000 (3秒) */
  pollInterval?: number;
  
  /** 进度回调函数 */
  onProgress?: (taskData: FluxTaskData) => void;
}