/**
 * Veo3 视频生成 API 类型定义
 */

/**
 * 文本转视频请求参数
 */
export interface Veo3GenerateOptions {
  /**
   * 描述所需视频内容的文本提示词。所有生成模式都需要。
   * - 应该详细且具体地描述视频内容
   * - 可以包含动作、场景、风格等信息
   * - 对于图片生成视频，描述希望图片如何动起来
   * @example "A dog playing in a park"
   * */
  prompt: string;

  /**
   * 图片链接列表（图片生成视频模式使用，目前仅支持1张图片）。
   * - 必须是有效的图片 URL
   * - 图片必须能被 API 服务器访问
   */
  imageUrls?: string[];

  /**
   * 选择使用的模型类型。
   * - "veo3" 标准模型，支持文本生成视频和图片生成视频
   * - "veo3_fast" 快速生成模型，支持文本生成视频和图片生成视频
   * @default "veo3"
   */
  model?: "veo3" | "veo3_fast";

  /** 水印文本 */
  watermark?: string;

  /**
   * 视频的宽高比。用于指定生成视频的尺寸比例。
   * - "16:9" 横屏视频格式，支持生成1080P高清视频（仅16:9比例支持生成1080P）
   * - "9:16" 竖屏视频格式，适合移动端短视频
   * @default "16:9"
   */
  aspectRatio?: "16:9" | "9:16";

  /**
   * 随机种子参数，用于控制生成内容的随机性。取值范围为10000-99999。
   *
   * 相同的种子会生成相似的视频内容，不同的种子会生成不同的视频内容。不填写时系统自动分配。
   */
  seeds?: number;

  /**
   * 回调 URL
   * 用于接收视频生成任务完成更新的URL地址。可选但推荐在生产环境中使用。
   * - 系统将在视频生成完成时向此URL发送POST请求，包含任务状态和结果
   * - 回调包含生成的视频URL、任务信息等内容
   * - 您的回调端点应能接受包含视频结果的JSON载荷的POST请求
   *  */
  callBackUrl?: string;

  /**
   * 是否启用托底机制。当设置为 true 时，如果官方 Veo3 视频生成服务不可用或出现异常，系统将自动切换到备用模型进行视频生成，以确保任务的连续性和可靠性。默认值为 false。
   * - 开启托底后，当遇到以下错误时会启用备用模型：
   *   - public error minor upload
   *   - Your prompt was flagged by Website as violating content policies
   *   - public error prominent people upload
   * - 托底模式要求 16:9 宽高比，默认使用 1080p 分辨率生成视频
   * - 通过托底机制生成的视频无法通过 Get 1080P Video 端点访问
   * - 积分消费说明：成功兜底的积分消耗是不同的，具体计费详情请查看 https://kie.ai/billing
   */
  enableFallback?: boolean;
}

export type Veo3TextToVideoOptions = Omit<Veo3GenerateOptions, "imageUrls">;
export type Veo3ImageToVideoOptions = Omit<Veo3GenerateOptions, "imageUrls"> & {
  imageUrl: string;
};

/**
 * 生成响应
 */
export interface Veo3GenerateResponse {
  taskId: string;
}

export enum Veo3TaskState {
  GENERATING = 0,
  SUCCESS = 1,
  FAIL = 2,
  GENERATE_FAIL = 3,
}

/**
 * 视频信息
 */
export interface Veo3TaskResponse {
  taskId: string;
  /** 生成的视频URL */
  resultUrls: string[];
  /** 原始视频URL。仅当aspectRatio不是16:9时才有值 */
  originUrls?: string[];
  /**
   * 视频分辨率信息
   * @example "1080p"
   *  */
  resolution: string;
}

/**
 * 任务详情数据
 */
export interface Veo3TaskData {
  /** 任务 ID */
  taskId: string;

  /** JSON 格式的请求参数 */
  paramJson: string;

  /** 任务完成时间 */
  completeTime: string | null;

  response: Veo3TaskResponse | null;

  /** 任务状态 */
  successFlag: Veo3TaskState;

  /**
   * 任务失败时的错误代码
   * - 400 - 您的提示词被网站标记为违反内容政策。 仅支持英文提示词。 无法获取图片。请验证您或您的服务提供商设置的任何访问限制。 公共错误：不安全的图片上传。
   * - 500 - 内部错误，请稍后重试。 内部错误 - 超时
   * - 501 - 失败 - 视频生成任务失败
   */
  errorCode: number | null;

  /** 任务失败时的错误消息 */
  errorMessage: string | null;

  /** 生成时间 */
  createTime: string;

  /**
   * 是否通过托底模型生成。
   * true表示使用了备用模型生成，false表示使用主模型生成 */
  fallbackFlag: boolean;
}

/**
 * 获取Veo3视频生成任务的高清1080P版本。
 * - 通过托底模式生成的视频无法通过此接口访问，因为它们默认已经是1080p分辨率。
 * - 仅 16:9 宽高比的视频支持 1080P 高清生成
 * - 视频生成任务成功后，系统会自动开始生成 1080P 高清版本
 * - 1080P 视频生成需要额外处理时间，建议在原视频生成完成后等待一段时间再调用本接口
 * - 如果 1080P 视频尚未准备好，接口可能返回错误信息
 * ## 重要说明
 * 1. 只有成功生成的视频任务才能获取 1080P 的版本
 * 2. 建议在收到视频生成成功回调后等待几分钟再调用本接口
 */
export interface Veo3Task1080PVideoResult {
  resultUrl: string;
}

export interface Veo3TaskCallbackData {
  taskId: string;
  /**
   * 任务完成信息，只有任务成功时才有这个字段
   *  */
  info?: {
    resultUrls: string[];
    resolution: string;
    /** 原始视频URL。仅当 aspectRatio 不是 16:9 时才有值 */
    originUrls?: string[];
  };
  fallbackFlag: boolean;
}
