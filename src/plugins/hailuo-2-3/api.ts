/**
 * Hailuo 2.3 Plugin API Interface
 * Hailuo Image-to-Video generation API
 */

/**
 * Model mode selection
 */
export type ModelMode = "pro" | "standard";

/**
 * Video resolution options
 */
export type VideoResolution = "768P" | "1080P";

/**
 * Video duration options (seconds as strings)
 */
export type VideoDuration = "6" | "10";

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
 * Image-to-Video generation options
 */
export interface ImageToVideoOptions {
  /**
   * Model mode: pro (high quality) or standard (fast)
   * @default "pro"
   */
  mode?: ModelMode;

  /**
   * Text prompt describing the desired video animation
   * Maximum length: 5000 characters
   */
  prompt: string;

  /**
   * Input image URL to animate
   * Supported formats: image/jpeg, image/png, image/webp
   * Max file size: 10MB
   */
  image_url: string;

  /**
   * Video duration in seconds
   * Note: 10 seconds videos are not supported for 1080P resolution
   * @default "6"
   */
  duration?: VideoDuration;

  /**
   * Video resolution
   * Note: 1080P resolution does not support 10 seconds duration
   * @default "768P"
   */
  resolution?: VideoResolution;

  /**
   * Callback URL for async notification
   * The system will send POST requests to this URL when the task completes
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
  /** Raw result JSON string (null if not completed) */
  resultJson: string | null;
  /** Parsed generation result (null if not completed) */
  result: VideoResult | null;
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
 * Hailuo 2.3 API Interface
 */
export interface Hailuo23API {
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
