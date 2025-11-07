/**
 * Grok Imagine Plugin API Interface
 * Grok image and video generation API
 */

/**
 * Generation mode options
 */
export type GenerationMode = "fun" | "normal" | "spicy";

/**
 * Aspect ratio options for text-to-video
 */
export type AspectRatio = "2:3" | "3:2" | "1:1";

/**
 * Task state
 */
export type TaskState =
  | "waiting"
  | "queuing"
  | "generating"
  | "success"
  | "fail";

/**
 * Text-to-Video generation options
 */
export interface TextToVideoOptions {
  /**
   * Text prompt describing the desired video motion
   * Maximum length: 5000 characters
   */
  prompt: string;

  /**
   * Aspect ratio of the output video
   * @default "2:3"
   */
  aspect_ratio?: AspectRatio;

  /**
   * Generation mode
   * @default "normal"
   */
  mode?: GenerationMode;

  /**
   * Callback URL for async notification
   */
  callBackUrl?: string;
}

/**
 * Image-to-Video generation options
 */
export interface ImageToVideoOptions {
  /**
   * Image URLs to use as input
   * Provide one or more image URLs
   * Max file size: 10MB
   * Accepted types: image/jpeg, image/png, image/webp
   * Note: Cannot be used together with task_id/index
   */
  image_urls?: string[];

  /**
   * Task ID of a grok-imagine/text-to-image generation
   * Must be used together with index
   * Max length: 100 characters
   * Note: Cannot be used together with image_urls
   */
  task_id?: string;

  /**
   * Index (0-based) selecting which image from task_id to use
   * Only valid when task_id is provided
   * Range: 0-5
   * @default 0
   */
  index?: number;

  /**
   * Text prompt describing the desired video motion
   * Maximum length: 5000 characters
   */
  prompt?: string;

  /**
   * Generation mode
   * @default "normal"
   */
  mode?: GenerationMode;

  /**
   * Callback URL for async notification
   */
  callBackUrl?: string;
}

/**
 * Upscale options
 */
export interface UpscaleOptions {
  /**
   * Task ID (supports only Kie AI–generated taskId)
   * Maximum length: 100 characters
   */
  task_id: string;

  /**
   * Callback URL for async notification
   */
  callBackUrl?: string;
}

/**
 * Task creation response
 */
export interface TaskResponse {
  /** Task ID */
  taskId: string;
}

/**
 * Video/Image generation result
 */
export interface MediaResult {
  /** Array of generated media URLs */
  resultUrls: string[];
}

/**
 * Task record
 */
export interface TaskRecord {
  /** Task ID */
  taskId: string;
  /** Model identifier */
  model: string;
  /** Current task state */
  state: TaskState;
  /** Request parameters */
  param: Record<string, any>;
  /** Generation result (null if not completed) */
  result: MediaResult | null;
  /** Raw result JSON string */
  resultJson: string | null;
  /** Failure code (null if successful) */
  failCode: string | null;
  /** Failure message (null if successful) */
  failMsg: string | null;
  /** Task duration in milliseconds (null if not completed) */
  costTime: number | null;
  /** Completion timestamp (null if not completed) */
  completeTime: number | null;
  /** Creation timestamp */
  createTime: number;
}

/**
 * Grok Imagine API Interface
 */
export interface GrokImagineAPI {
  /**
   * Generate video from text prompt
   * @param options - Text to video generation options
   * @returns Task creation response with taskId
   */
  textToVideo(options: TextToVideoOptions): Promise<TaskResponse>;

  /**
   * Generate video from image
   * @param options - Image to video generation options
   * @returns Task creation response with taskId
   */
  imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse>;

  /**
   * Upscale generated content
   * @param options - Upscale options with task_id
   * @returns Task creation response with taskId
   */
  upscale(options: UpscaleOptions): Promise<TaskResponse>;

  /**
   * Get task record by task ID
   * @param taskId - Task identifier
   * @returns Complete task record with status and results
   */
  getTaskRecord(taskId: string): Promise<TaskRecord>;
}
