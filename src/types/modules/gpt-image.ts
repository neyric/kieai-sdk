/**
 * GPT-4o Image API 相关类型定义
 */

/**
 * 图片尺寸比例
 */
export type ImageSize = "1:1" | "3:2" | "2:3";

/**
 * 任务状态枚举
 */
export enum TaskStatusCode {
  /** 生成中 */
  GENERATING = 0,
  /** 成功 */
  SUCCESS = 1,
  /** 失败 */
  FAILED = 2,
}

/**
 * API 请求参数
 */
export interface GeneratorGPT4oImageOptions {
  /** 图片尺寸比例，必需参数 */
  size: ImageSize;

  /** 文本描述 */
  prompt?: string;

  /** 文件URL列表，例如图片URL列表。最多支持5张图片。支持的文件格式：.jfif、.pjpeg、.jpeg、.pjp、.jpg、.png、.webp */
  filesUrl?: string[];

  /**
   * 蒙版图片URL。你可以提供一个蒙版（mask）来指示图像应该在哪些区域进行编辑。
   *
   * 蒙版中黑色的部分将被替换或修改，其他区域使用白色填充。你可以使用文字描述你希望最终编辑后的图像是什么样子，或者具体想要修改哪些内容。
   *  */
  maskUrl?: string;

  /** 生成变体数量，可选 1、2、4 */
  nVariants?: 1 | 2 | 4;

  /**
   * 是否启用提示词增强，在大多数情况下，启用此功能是不必要的。
   *
   * 但是，对于生成 3D 图像等特定场景，启用它可以产生更精细的效果。谨慎使用。
   * */
  isEnhance?: boolean;

  /** 指定图片上传的服务器区域。设置为 true 时使用中国大陆服务器，false 时使用海外服务器。可根据您的地理位置选择最优的上传节点以获得更好的上传速度 */
  uploadCn?: boolean;

  /**
   * 是否启用后备托底机制
   * @true 如果官方 GPT-4o 图像生成服务不可用或出现异常，系统将自动切换到备用模型（如 Flux 等）进行图像生成，以确保任务的连续性和可靠性。
   * @default false
   */
  enableFallback?: boolean;

  /**
   * 指定托底模型。当 enableFallback 为 true 时生效，用于选择在主模型不可用时使用哪个备用模型来生成图片。
   * @enum "GPT_IMAGE_1"
   * @enum "FLUX_MAX"
   * @default FLUX_MAX
   *  */
  fallbackModel?: "FLUX_MAX" | "GPT_IMAGE_1";

  /**
   * 任务完成后的 Callback 回调 URL
   * - 系统将在4o图像生成完成时向此URL发送POST请求，包含任务状态和结果
   * - Callback 包含生成的图像URL和任务信息，支持所有变体
   * - 您的回调端点应能接受包含图像生成结果的JSON载荷的POST请求
   *  */
  callBackUrl?: string;
}

/**
 * 图片生成选项（文本生成图片）
 */
export type GenerateImageOptions = Omit<GeneratorGPT4oImageOptions, "maskUrl">;

/**
 * 图片编辑选项
 */
export type EditImageOptions = Omit<GeneratorGPT4oImageOptions, "filesUrl"> & {
  /** 输入图片URL列表 */
  fileUrl: string;

  /** 遮罩图片URL */
  maskUrl: string;
};

export interface GeneratorGPT4oImageResponse {
  taskId: string;
}

/**
 * 任务详情响应中的任务数据
 */
export interface TaskData {
  /** 任务ID */
  taskId: string;

  /** 参数JSON字符串 */
  paramJson: string;

  /** 完成时间 */
  completeTime: number | null;

  /** 响应结果 */
  response: {
    result_urls: string[];
  } | null;

  /** 任务状态标志 */
  successFlag: TaskStatusCode;

  /** 任务状态 */
  status: "GENERATING" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_FAILED";

  /** 错误代码 */
  errorCode: number | null;

  /** 错误消息 */
  errorMessage: string | null;

  /** 创建时间 */
  createTime: number;

  /** 进度 (0.00-1.00) */
  progress: string | null;
}

/**
 * 下载URL请求参数
 */
export interface DownloadUrlRequest {
  imageUrl: string;
}

/**
 * 下载URL响应
 */
export interface DownloadUrlResponse {
  downloadUrl: string;
}
