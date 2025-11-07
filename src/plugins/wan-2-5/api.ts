/**
 * Wan 2.5 Plugin API Interface
 * Alibaba Wan 2.5 video generation API
 */

/**
 * Video resolution options
 */
export type VideoResolution = "720p" | "1080p";

/**
 * Video duration options (string format as per API spec)
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
   * Text prompt describing the desired video
   * Maximum length: 800 characters
   */
  prompt: string;

  /**
   * Video duration in seconds
   * @default "5"
   */
  duration?: VideoDuration;

  /**
   * Video resolution
   * @default "1080p"
   */
  resolution?: VideoResolution;

  /**
   * Negative prompt to describe content to avoid
   * Maximum length: 500 characters
   */
  negative_prompt?: string;

  /**
   * Enable prompt rewriting using LLM
   * @default true
   */
  enable_prompt_expansion?: boolean;

  /**
   * Random seed for reproducibility
   * If undefined, a random seed is chosen
   */
  seed?: number;

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
   * URL of the image to use as the first frame
   * Must be publicly accessible
   * Supported formats: image/jpeg, image/png, image/webp
   * Max size: 10MB
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
  /** Request parameters */
  param: Record<string, any>;
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
 * Wan 2.5 API Interface
 */
export interface Wan25API {
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
