/**
 * Midjourney API 相关类型定义
 */

/**
 * 支持的图片宽高比
 */
export type MidjourneyAspectRatio = 
  | '1:1'      // 正方形
  | '16:9'     // 宽屏 HD
  | '9:16'     // 移动端竖屏
  | '4:3'      // 标准显示屏
  | '3:4'      // 杂志布局（竖版）
  | '2:3'      // 传统照片比例
  | '3:2'      // 传统横向照片比例
  | '5:4'      // 中画幅相机比例
  | '4:5'      // 中画幅相机比例（竖版）
  | '3:5'      // 超宽竖版
  | '5:3';     // 超宽横版

/**
 * Midjourney 模型版本
 */
export type MidjourneyVersion = 
  | '7'        // 最新模型（推荐）
  | '6.1'      // 上一版本
  | '6'        // 旧版本
  | 'niji6';   // 动漫/插画专用模型

/**
 * 生成速度选项
 */
export type MidjourneySpeed = 
  | 'relaxed'  // 慢速（免费层选项）
  | 'fast'     // 标准速度
  | 'turbo';   // 快速（高级选项）

/**
 * 任务类型
 */
export type MidjourneyTaskType = 
  | 'mj_txt2img'  // 文本转图片
  | 'mj_img2img'  // 图片转图片
  | 'mj_video';   // 图片转视频

/**
 * 任务状态枚举
 */
export enum MidjourneyTaskStatus {
  /** 生成中 */
  GENERATING = 0,
  /** 成功 */
  SUCCESS = 1,
  /** 任务失败 */
  TASK_FAILED = 2,
  /** 生成失败（任务创建成功但生成失败） */
  GENERATE_FAILED = 3
}

/**
 * Midjourney 生成请求参数
 */
export interface MidjourneyGenerateRequest {
  /** 任务类型（必需） */
  taskType: MidjourneyTaskType;
  
  /** 文本描述（必需） */
  prompt: string;
  
  /** 生成速度，默认 'fast' */
  speed?: MidjourneySpeed;
  
  /** 图片宽高比，默认 '1:1' */
  aspectRatio?: MidjourneyAspectRatio;
  
  /** 模型版本，默认 '7' */
  version?: MidjourneyVersion;
  
  /** 输入图片 URL（用于 img2img 和 video 模式） */
  fileUrl?: string;
  
  /** 艺术风格化强度 (0-1000)，默认 100 */
  stylization?: number;
  
  /** 混乱程度 (0-100)，增加结果的不可预测性 */
  chaos?: number;
  
  /** 质量设置 (0.25, 0.5, 1, 2)，默认 1 */
  quality?: number;
  
  /** 重复次数 (1-4)，生成多个不同版本 */
  repeat?: number;
  
  /** 排除内容（负面提示词） */
  no?: string;
  
  /** 停止比例 (10-100)，控制生成完成度 */
  stop?: number;
  
  /** 回调 URL */
  callBackUrl?: string;
  
  /** 是否使用中国服务器上传，默认 false */
  uploadCn?: boolean;
  
  /** 水印标识符 */
  watermark?: string;
}

/**
 * Midjourney 生成响应
 */
export interface MidjourneyGenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

/**
 * 图片放大请求参数
 */
export interface MidjourneyUpscaleRequest {
  /** 原始任务 ID */
  taskId: string;
  
  /** 要放大的图片索引 (1-4) */
  index: number;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 图片放大响应
 */
export interface MidjourneyUpscaleResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

/**
 * 图片变体请求参数
 */
export interface MidjourneyVaryRequest {
  /** 原始任务 ID */
  taskId: string;
  
  /** 要变化的图片索引 (1-4) */
  index: number;
  
  /** 变体类型，默认 'subtle' */
  varyType?: 'subtle' | 'strong';
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 图片变体响应
 */
export interface MidjourneyVaryResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

/**
 * 单个结果图片信息
 */
export interface MidjourneyImageResult {
  /** 图片 URL */
  resultUrl: string;
  
  /** 图片序号 (1-4) */
  index?: number;
  
  /** 图片描述信息 */
  description?: string;
}

/**
 * 任务完成后的响应结果
 */
export interface MidjourneyTaskResponse {
  /** 生成的图片 URL 列表 */
  resultUrls: MidjourneyImageResult[];
  
  /** 任务类型 */
  taskType?: MidjourneyTaskType;
  
  /** 原始提示词 */
  prompt?: string;
  
  /** 生成耗时（秒） */
  duration?: number;
  
  /** 消耗积分 */
  credits?: number;
}

/**
 * 任务详情响应中的任务数据
 */
export interface MidjourneyTaskData {
  /** 任务 ID */
  taskId: string;
  
  /** 参数 JSON 字符串 */
  paramJson: string;
  
  /** 完成时间 */
  completeTime: string | null;
  
  /** 响应结果 */
  resultInfoJson: MidjourneyTaskResponse | null;
  
  /** 任务状态标志 */
  successFlag: MidjourneyTaskStatus;
  
  /** 错误代码 */
  errorCode: number | null;
  
  /** 错误消息 */
  errorMessage: string | null;
  
  /** 创建时间 */
  createTime: string;
  
  /** 进度百分比（0-100） */
  progress?: number | null;
  
  /** 预计剩余时间（秒） */
  estimatedTime?: number | null;
}

/**
 * 任务状态查询响应
 */
export interface MidjourneyTaskDetailsResponse {
  code: number;
  msg: string;
  data: MidjourneyTaskData;
}

/**
 * 回调响应数据结构
 */
export interface MidjourneyCallbackData {
  code: number;
  msg: string;
  data: {
    info: MidjourneyTaskResponse;
  };
}

/**
 * 文本转图片选项（简化版本，用于用户接口）
 */
export interface MidjourneyTextToImageOptions {
  /** 文本描述 */
  prompt: string;
  
  /** 生成速度，默认 'fast' */
  speed?: MidjourneySpeed;
  
  /** 图片宽高比，默认 '1:1' */
  aspectRatio?: MidjourneyAspectRatio;
  
  /** 模型版本，默认 '7' */
  version?: MidjourneyVersion;
  
  /** 艺术风格化强度 (0-1000)，默认 100 */
  stylization?: number;
  
  /** 混乱程度 (0-100) */
  chaos?: number;
  
  /** 质量设置 (0.25, 0.5, 1, 2)，默认 1 */
  quality?: number;
  
  /** 重复次数 (1-4) */
  repeat?: number;
  
  /** 排除内容（负面提示词） */
  no?: string;
  
  /** 停止比例 (10-100) */
  stop?: number;
  
  /** 回调 URL */
  callBackUrl?: string;
  
  /** 是否使用中国服务器上传，默认 false */
  uploadCn?: boolean;
  
  /** 水印标识符 */
  watermark?: string;
}

/**
 * 图片转图片选项
 */
export interface MidjourneyImageToImageOptions extends MidjourneyTextToImageOptions {
  /** 输入图片 URL（必需） */
  fileUrl: string;
}

/**
 * 图片转视频选项
 */
export interface MidjourneyImageToVideoOptions {
  /** 文本描述 */
  prompt: string;
  
  /** 输入图片 URL（必需） */
  fileUrl: string;
  
  /** 模型版本，默认 '7' */
  version?: MidjourneyVersion;
  
  /** 回调 URL */
  callBackUrl?: string;
  
  /** 是否使用中国服务器上传，默认 false */
  uploadCn?: boolean;
  
  /** 水印标识符 */
  watermark?: string;
}

/**
 * 等待完成选项
 */
export interface MidjourneyWaitForCompletionOptions {
  /** 最大等待时间（毫秒），默认 600000 (10分钟) */
  maxWaitTime?: number;
  
  /** 轮询间隔（毫秒），默认 30000 (30秒) */
  pollInterval?: number;
  
  /** 进度回调函数 */
  onProgress?: (taskData: MidjourneyTaskData) => void;
}