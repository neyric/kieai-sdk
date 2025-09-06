/**
 * Midjourney API 相关类型定义
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
export type MidjourneySpeed =
  | "relaxed" // 慢速（免费层选项）
  | "fast" // 标准速度
  | "turbo"; // 快速（高级选项）

/**
 * 任务类型
 */
export type MidjourneyTaskType =
  | "mj_txt2img" // 文本转图片
  | "mj_img2img" // 图片转图片
  | "mj_style_reference" // 风格参考
  | "mj_omni_reference" // 全能参考
  | "mj_video" // 图片转视频
  | "mj_video_hd"; // 图片转高清视频

/** 视频中的运动水平 */
export type MidjourneyMotion = "high" | "low";

/**
 * Midjourney 生成请求参数
 */
export interface MidjourneyGenerateRequest {
  /** 任务类型（必需） */
  taskType: MidjourneyTaskType;

  /** 文本描述（必需） */
  prompt: string;

  /**
   * 生成速度，可以是 'fast'、'relaxed'或'turbo'，对应Midjourney的不同速度。
   * 当taskType为mj_video、mj_video_hd或mj_omni_reference时，此参数不需要
   *  */
  speed?: MidjourneySpeed;

  /**
   * 输入图片URL数组（图生图、图生视频时必填）。
   * - 生成视频时fileUrls只能有一个图片链接
   * - 必须是有效的图片URL
   * - 文生图时留空
   */
  fileUrls?: string[];

  /**
   * 输出图片/视频的宽高比。
   */
  aspectRatio?: MidjourneyAspectRatio;

  /** 模型版本 */
  version?: MidjourneyVersion;

  /**
   * 控制生成图片的多样性。
   * - 按 5 递增，如：0, 5, 10, 15...
   * - 较高值创建更多样化的结果
   * - 较低值创建更一致的结果
   * */
  variety?: number;

  /**
   * 艺术风格化强度 (0-1000)
   * - 控制艺术风格强度，建议该值为50的倍数
   * - 较高值创建更风格化的结果
   * - 较低值创建更真实的结果
   * */
  stylization?: number;

  /**
   * 古怪性程度（0-3000）。
   * - 控制创造性和独特性
   * - 较高值创建更不寻常的结果
   * - 较低值创建更常规的结果
   * - 建议该值为100的倍数
   */
  weirdness?: number;

  /**
   * Omni 强度参数。控制 omni 参考效果的强度。范围：1-1000，每次增加 1（如 1、2、3）。
   * - 仅在 taskType 为 'mj_omni_reference' 时使用
   * - 使用 Omni 参考功能，允许您将参考图像中的角色、物体、车辆或非人类生物放入您的 Midjourney 创作中
   * - 数值越高，参考影响越强，数值越低，允许更多创意解释
   */
  ow?: number;

  /** 水印标识符 */
  watermark?: string;

  /**
   * 是否启用自动翻译功能。由于 prompt 仅支持英文，当此参数为 true 时，系统会自动将非英文的提示词翻译成英文
   * 如果您的提示词已经是英文，可设置为 false
   * @default false
   */
  enableTranslation?: boolean;

  /** 回调 URL */
  callBackUrl?: string;

  /**
   * 视频生成数量。仅在 taskType 为 'mj_video' 或 'mj_video_hd' 时有效。
   */
  videoBatchSize?: 1 | 2 | 4;

  /**
   * 视频生成的运动参数。控制生成视频中的运动水平。
   * high：高运动水平（默认）| low：低运动水平
   * 当 taskType 为 'mj_video' 或 'mj_video_hd' 时为必填参数
   * 仅在 taskType 为 'mj_video' 或 'mj_video_hd' 时有效
   * @default "high"
   */
  motion?: MidjourneyMotion;
}

/** 扩展 Midjourney 视频 */
export interface MidjourneyGenerateVideoExtendRequest {
  /**
   * 视频生成模式的扩展类型
   * @remarks
   * - "mj_video_extend_manual"：使用自定义提示词的手动扩展，需用户提供 prompt，描述视频后续内容。
   * - "mj_video_extend_auto"：使用 AI 自动生成延续内容，无需用户提供 prompt，系统自动生成视频后续内容。
   */
  taskType: "mj_video_extend_manual" | "mj_video_extend_auto";
  /** 要扩展的原始MJ视频记录的任务ID */
  taskId: string;
  /** 要扩展的原始记录中的视频索引 */
  index: number;
  /**
   * 延续提示词，描述视频中接下来应该发生什么
   * mj_video_extend_manual 时必填。最大长度：2000个字符
   * @example "继续场景，宇宙飞船加速进入彩色星云，带有动态光迹"
   *  */
  prompt?: string;
  watermark?: string;
  callBackUrl?: string;
}

/** 图片放大请求参数 */
export interface MidjourneyUpscaleRequest {
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
 * 图片变体请求参数
 */
export interface MidjourneyVaryRequest {
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
 * Midjourney 生成响应
 */
export interface MidjourneyTaskGenerateResponse {
  taskId: string;
}

export interface MidjourneyGenerateResult {
  resultUrls: { resultUrl: string }[];
}

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
  GENERATE_FAILED = 3,
}

/**
 * 任务详情响应中的任务数据
 */
export interface MidjourneyTaskData {
  /** 任务 ID */
  taskId: string;

  /** 任务类型 */
  taskType: MidjourneyTaskType;

  /** 参数 JSON 字符串 */
  paramJson: string;

  /** 完成时间 */
  completeTime: string | null;

  /** 响应结果 */
  resultInfoJson: MidjourneyGenerateResult | null;

  /** 任务状态标志 */
  successFlag: MidjourneyTaskStatus;

  /** 错误代码 */
  errorCode: number | null;

  /** 错误消息 */
  errorMessage: string | null;

  /** 创建时间 */
  createTime: string;
}

/**
 * 回调响应数据结构
 */
export interface MidjourneyCallbackData {
  taskId: string;
  promptJson: string;
  resultUrls: string[];
}
