/**
 * Kling 2.5 Plugin API Interface
 * Kling AI video generation API
 */

/**
 * Video duration options (seconds)
 */
export type VideoDuration = "5" | "10";

/**
 * Video aspect ratio
 */
export type AspectRatio = "16:9" | "9:16" | "1:1";

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
 * Base options for video generation
 */
export interface BaseVideoOptions {
  /**
   * Text prompt for the video generation
   * Maximum length: 2500 characters
   */
  prompt: string;

  /**
   * Video duration in seconds
   * @default "5"
   */
  duration?: VideoDuration;

  /**
   * Negative prompt - things to avoid in the generated video
   * Maximum length: 2500 characters
   * @default "blur, distort, and low quality"
   */
  negative_prompt?: string;

  /**
   * CFG (Classifier Free Guidance) scale
   * Measure of how close the model should stick to your prompt
   * Range: 0 - 1 (step: 0.1)
   * @default 0.5
   */
  cfg_scale?: number;

  /**
   * Callback URL for async notification
   */
  callBackUrl?: string;
}

/**
 * Text-to-Video generation options
 */
export interface TextToVideoOptions extends BaseVideoOptions {
  /**
   * Video aspect ratio
   * @default "16:9"
   */
  aspect_ratio?: AspectRatio;
}

/**
 * Image-to-Video generation options
 */
export interface ImageToVideoOptions extends BaseVideoOptions {
  /**
   * URL of the image to be used for the video
   * Max file size: 10MB
   * Accepted formats: image/jpeg, image/png, image/webp
   */
  image_url: string;
}

/**
 * Task creation response
 */
export interface TaskResponse {
  /** Task ID */
  taskId: string;
}

/**
 * Video generation result
 */
export interface VideoResult {
  /** Array of generated video URLs */
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
  /** Request parameters (JSON string) */
  param: string;
  /** Generation result (null if not completed) */
  result: VideoResult | null;
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
 * Kling 2.5 API Interface
 */
export interface Kling25API {
  /**
   * Generate video from text
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
   * Get task record by task ID
   * @param taskId - Task identifier
   * @returns Complete task record with status and results
   */
  getTaskRecord(taskId: string): Promise<TaskRecord>;
}
