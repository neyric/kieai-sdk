/**
 * Veo3 视频生成 API 类型定义
 */

/**
 * 支持的视频宽高比
 */
export type Veo3AspectRatio = 
  | '16:9'     // 宽屏（推荐用于横向内容）
  | '9:16'     // 垂直（完美适用于移动端和社交媒体）
  | '1:1'      // 方形（社交媒体帖子）
  | '4:3'      // 传统格式
  | '3:4';     // 肖像方向

/**
 * 视频质量设置
 */
export type Veo3VideoQuality = 
  | '720p'     // 高清质量，兼容所有时长
  | '1080p';   // 全高清质量，仅适用于5秒视频

/**
 * 视频时长（秒）
 */
export type Veo3VideoDuration = 5 | 10;

/**
 * 任务状态
 */
export type Veo3TaskState = 
  | 'wait'       // 等待中
  | 'queueing'   // 排队中
  | 'generating' // 生成中
  | 'success'    // 成功
  | 'fail';      // 失败

/**
 * 文本转视频请求参数
 */
export interface Veo3TextToVideoRequest {
  /** 文本描述（必需） */
  prompt: string;
  
  /** 视频时长，默认 5 秒 */
  duration?: Veo3VideoDuration;
  
  /** 视频质量，默认 '720p' */
  quality?: Veo3VideoQuality;
  
  /** 视频宽高比，默认 '16:9' */
  aspectRatio?: Veo3AspectRatio;
  
  /** 水印文本 */
  waterMark?: string;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 图片转视频请求参数
 */
export interface Veo3ImageToVideoRequest {
  /** 文本描述（必需） */
  prompt: string;
  
  /** 输入图片 URL（必需） */
  imageUrl: string;
  
  /** 视频时长，默认 5 秒 */
  duration?: Veo3VideoDuration;
  
  /** 视频质量，默认 '720p' */
  quality?: Veo3VideoQuality;
  
  /** 视频宽高比，默认 '16:9' */
  aspectRatio?: Veo3AspectRatio;
  
  /** 水印文本 */
  waterMark?: string;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 视频延长请求参数
 */
export interface Veo3ExtendVideoRequest {
  /** 原始任务 ID（必需） */
  taskId: string;
  
  /** 扩展描述（必需） */
  prompt: string;
  
  /** 视频质量，默认 '720p' */
  quality?: Veo3VideoQuality;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 生成响应
 */
export interface Veo3GenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

/**
 * 视频信息
 */
export interface Veo3VideoInfo {
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
export interface Veo3TaskData {
  /** 任务 ID */
  taskId: string;
  
  /** 任务状态 */
  state: Veo3TaskState;
  
  /** 生成时间 */
  generateTime: string;
  
  /** 视频信息（成功时才有） */
  videoInfo?: Veo3VideoInfo;
  
  /** 过期标志（0=未过期，1=已过期） */
  expireFlag: 0 | 1;
  
  /** 失败消息（失败时才有） */
  failMsg?: string;
}

/**
 * 任务状态查询响应
 */
export interface Veo3TaskDetailsResponse {
  code: number;
  msg: string;
  data: Veo3TaskData;
}

/**
 * 回调数据结构
 */
export interface Veo3CallbackData {
  taskId: string;
  code: number;
  msg: string;
  data: Veo3TaskData;
}

/**
 * 文本转视频选项（用户接口）
 */
export interface Veo3TextToVideoOptions {
  /** 文本描述（必需） */
  prompt: string;
  
  /** 视频时长，默认 5 秒 */
  duration?: Veo3VideoDuration;
  
  /** 视频质量，默认 '720p' */
  quality?: Veo3VideoQuality;
  
  /** 视频宽高比，默认 '16:9' */
  aspectRatio?: Veo3AspectRatio;
  
  /** 水印文本 */
  waterMark?: string;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 图片转视频选项（用户接口）
 */
export interface Veo3ImageToVideoOptions {
  /** 文本描述（必需） */
  prompt: string;
  
  /** 输入图片 URL（必需） */
  imageUrl: string;
  
  /** 视频时长，默认 5 秒 */
  duration?: Veo3VideoDuration;
  
  /** 视频质量，默认 '720p' */
  quality?: Veo3VideoQuality;
  
  /** 视频宽高比，默认 '16:9' */
  aspectRatio?: Veo3AspectRatio;
  
  /** 水印文本 */
  waterMark?: string;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 视频延长选项（用户接口）
 */
export interface Veo3ExtendVideoOptions {
  /** 原始任务 ID（必需） */
  taskId: string;
  
  /** 扩展描述（必需） */
  prompt: string;
  
  /** 视频质量，默认 '720p' */
  quality?: Veo3VideoQuality;
  
  /** 回调 URL */
  callBackUrl?: string;
}

/**
 * 生成结果（成功时的任务数据）
 */
export interface Veo3GenerationResult extends Veo3TaskData {
  state: 'success';
  videoInfo: Veo3VideoInfo;
}