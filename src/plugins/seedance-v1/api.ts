/**
 * SeeDance V1 Plugin API Interface
 * ByteDance SeeDance video generation API
 */

/**
 * Model mode selection
 */
export type ModelMode = 'pro' | 'lite';

/**
 * Video resolution options
 */
export type VideoResolution = '480p' | '720p' | '1080p';

/**
 * Video duration options (seconds)
 */
export type VideoDuration = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Video aspect ratio
 */
export type AspectRatio = '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '9:21';

/**
 * Task state
 */
export type TaskState = 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';

/**
 * Base options for video generation
 */
export interface BaseVideoOptions {
  /**
   * Model mode: pro (high quality) or lite (fast)
   * @default "pro"
   */
  mode?: ModelMode;

  /**
   * Text prompt
   * Maximum length: 10000 characters
   */
  prompt: string;

  /**
   * Video resolution
   * @default "720p"
   */
  resolution?: VideoResolution;

  /**
   * Video duration in seconds
   * @default 5
   */
  duration?: VideoDuration;

  /**
   * Fix camera position
   * @default false
   */
  camera_fixed?: boolean;

  /**
   * Random seed for reproducibility
   * Use -1 for random
   * @default -1
   */
  seed?: number;

  /**
   * Enable safety checker
   * @default true
   */
  enable_safety_checker?: boolean;

  /**
   * Callback URL for async notification
   */
  callBackUrl?: string;
}

/**
 * Image-to-Video generation options
 */
export interface ImageToVideoOptions extends BaseVideoOptions {
  /**
   * Start image URL
   * Supported formats: image/jpeg, image/png, image/webp
   * Max size: 10.0MB
   */
  image_url: string;

  /**
   * End image URL (optional)
   * Supported formats: image/jpeg, image/png, image/webp
   * Max size: 10.0MB
   */
  end_image_url?: string;
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
  /** Request parameters */
  param: Record<string, any>;
  /** Generation result (null if not completed) */
  result: VideoResult | null;
  /** Raw result JSON string */
  resultJson: string | null;
  /** Failure code (null if successful) */
  failCode: number | null;
  /** Failure message (null if successful) */
  failMsg: string | null;
  /** Completion timestamp (null if not completed) */
  completeTime: number | null;
  /** Creation timestamp */
  createTime: number;
  /** Last update timestamp */
  updateTime: number;
}

/**
 * SeeDance V1 API Interface
 */
export interface SeeDanceV1API {
  /**
   * Generate video from image
   * @param options - Image to video generation options
   * @returns Task creation response with taskId
   */
  imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse>;

  /**
   * Generate video from text
   * @param options - Text to video generation options
   * @returns Task creation response with taskId
   */
  textToVideo(options: TextToVideoOptions): Promise<TaskResponse>;

  /**
   * Get task record by task ID
   * @param taskId - Task identifier
   * @returns Complete task record with status and results
   */
  getTaskRecord(taskId: string): Promise<TaskRecord>;
}
