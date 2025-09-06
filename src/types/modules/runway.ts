/**
 * Runway API 相关类型定义
 */

/**
 * 支持的视频宽高比
 */
export type RunwayAspectRatio = 
  | '16:9'     // 宽屏 HD（推荐）
  | '9:16'     // 移动端竖屏
  | '1:1'      // 正方形
  | '4:3'      // 传统显示屏
  | '3:4';     // 竖版

/**
 * 视频质量设置
 */
export type RunwayVideoQuality = 
  | '720p'     // HD 高清（兼容 5秒和10秒）
  | '1080p';   // Full HD 全高清（仅支持5秒）

/**
 * 视频时长（秒）
 */
export type RunwayVideoDuration = 5 | 10;

/**
 * 任务状态
 */
export type RunwayTaskState = 
  | 'wait'       // 等待中
  | 'queueing'   // 排队中
  | 'generating' // 生成中
  | 'success'    // 成功
  | 'fail';      // 失败

/**
 * 生成类型
 */
export type RunwayGenerationType = 
  | 'text_to_video'      // 文本转视频
  | 'image_to_video'     // 图片转视频
  | 'video_extension';   // 视频扩展

/**
 * 基础生成请求参数
 */
export interface RunwayBaseGenerateRequest {
  /** 文本描述（必需） */
  prompt: string;
  
  /** 视频时长，默认 5 秒 */
  duration?: RunwayVideoDuration;
  
  /** 视频质量，默认 '720p' */
  quality?: RunwayVideoQuality;
  
  /** 视频宽高比，默认 '16:9' */
  aspectRatio?: RunwayAspectRatio;
  
  /** 水印文本 */
  waterMark?: string;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 文本转视频请求参数
 */
export interface RunwayTextToVideoRequest extends RunwayBaseGenerateRequest {
  // 继承基础参数
}

/**
 * 图片转视频请求参数
 */
export interface RunwayImageToVideoRequest extends RunwayBaseGenerateRequest {
  /** 输入图片 URL（必需） */
  imageUrl: string;
}

/**
 * 视频扩展请求参数
 */
export interface RunwayExtendVideoRequest {
  /** 原始任务 ID（必需） */
  taskId: string;
  
  /** 扩展描述（必需） */
  prompt: string;
  
  /** 视频质量，默认 '720p' */
  quality?: RunwayVideoQuality;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 生成响应
 */
export interface RunwayGenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

/**
 * 视频信息
 */
export interface RunwayVideoInfo {
  /** 视频 ID */
  videoId: string;
  
  /** 视频 URL */
  videoUrl: string;
  
  /** 缩略图 URL */
  imageUrl: string;
}

/**
 * 任务详情数据
 */
export interface RunwayTaskData {
  /** 任务 ID */
  taskId: string;
  
  /** 任务状态 */
  state: RunwayTaskState;
  
  /** 生成时间 */
  generateTime: string;
  
  /** 视频信息（成功时才有） */
  videoInfo?: RunwayVideoInfo;
  
  /** 过期标志（0=未过期，1=已过期） */
  expireFlag: 0 | 1;
  
  /** 失败消息（失败时才有） */
  failMsg?: string;
}

/**
 * 任务状态查询响应
 */
export interface RunwayTaskDetailsResponse {
  code: number;
  msg: string;
  data: RunwayTaskData;
}

/**
 * 回调数据结构
 */
export interface RunwayCallbackData {
  code: number;
  msg: string;
  data: RunwayTaskData;
}

/**
 * 文本转视频选项（用户接口）
 */
export interface RunwayTextToVideoOptions {
  /** 文本描述（必需） */
  prompt: string;
  
  /** 视频时长，默认 5 秒 */
  duration?: RunwayVideoDuration;
  
  /** 视频质量，默认 '720p' */
  quality?: RunwayVideoQuality;
  
  /** 视频宽高比，默认 '16:9' */
  aspectRatio?: RunwayAspectRatio;
  
  /** 水印文本 */
  waterMark?: string;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 图片转视频选项（用户接口）
 */
export interface RunwayImageToVideoOptions {
  /** 文本描述（必需） */
  prompt: string;
  
  /** 输入图片 URL（必需） */
  imageUrl: string;
  
  /** 视频时长，默认 5 秒 */
  duration?: RunwayVideoDuration;
  
  /** 视频质量，默认 '720p' */
  quality?: RunwayVideoQuality;
  
  /** 视频宽高比，默认 '16:9' */
  aspectRatio?: RunwayAspectRatio;
  
  /** 水印文本 */
  waterMark?: string;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 视频扩展选项（用户接口）
 */
export interface RunwayExtendVideoOptions {
  /** 原始任务 ID（必需） */
  taskId: string;
  
  /** 扩展描述（必需） */
  prompt: string;
  
  /** 视频质量，默认 '720p' */
  quality?: RunwayVideoQuality;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 等待完成选项
 */
export interface RunwayWaitForCompletionOptions {
  /** 最大等待时间（毫秒），默认 600000 (10分钟) */
  maxWaitTime?: number;
  
  /** 轮询间隔（毫秒），默认 30000 (30秒) */
  pollInterval?: number;
  
  /** 进度回调函数 */
  onProgress?: (taskData: RunwayTaskData) => void;
}

/**
 * 生成结果（成功时的任务数据）
 */
export interface RunwayGenerationResult extends RunwayTaskData {
  state: 'success';
  videoInfo: RunwayVideoInfo;
}