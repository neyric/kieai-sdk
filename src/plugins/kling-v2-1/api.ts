/**
 * Kling V2.1 Plugin API Interface
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
   * Text prompt describing the video
   * Maximum length: 5000 characters
   */
  prompt: string;

  /**
   * Video duration in seconds
   * @default "5"
   */
  duration?: VideoDuration;

  /**
   * Negative prompt to exclude certain elements
   * Maximum length: 500 characters
   * @default "blur, distort, and low quality"
   */
  negative_prompt?: string;

  /**
   * CFG (Classifier Free Guidance) scale
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
 * Master Text-to-Video generation options
 */
export interface MasterTextToVideoOptions extends BaseVideoOptions {
  /**
   * Video aspect ratio
   * @default "16:9"
   */
  aspect_ratio?: AspectRatio;
}

/**
 * Master Image-to-Video generation options
 */
export interface MasterImageToVideoOptions extends BaseVideoOptions {
  /**
   * Image URL
   * Supported formats: image/jpeg, image/png, image/webp
   * Max size: 10MB
   */
  image_url: string;
}

/**
 * Standard Image-to-Video generation options
 */
export interface StandardImageToVideoOptions extends BaseVideoOptions {
  /**
   * Image URL
   * Supported formats: image/jpeg, image/png, image/webp
   * Max size: 10MB
   */
  image_url: string;
}

/**
 * Pro Image-to-Video generation options
 */
export interface ProImageToVideoOptions extends BaseVideoOptions {
  /**
   * Start image URL
   * Supported formats: image/jpeg, image/png, image/webp
   * Max size: 10MB
   */
  image_url: string;

  /**
   * End image URL (optional)
   * Supported formats: image/jpeg, image/png, image/webp
   * Max size: 10MB
   */
  tail_image_url?: string;
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
 * Parsed task record with typed fields
 */
export interface ParsedTaskRecord
  extends Omit<TaskRecord, "param" | "resultJson"> {
  /** Parsed request parameters */
  param: Record<string, any>;
  /** Parsed generation result (null if not completed) */
  result: VideoResult | null;
}

/**
 * Kling V2.1 API Interface
 */
export interface KlingV21API {
  /**
   * Generate video from text using Master Text-to-Video model
   * @param options - Text to video generation options
   * @returns Task creation response with taskId
   */
  masterTextToVideo(options: MasterTextToVideoOptions): Promise<TaskResponse>;

  /**
   * Generate video from image using Master Image-to-Video model
   * @param options - Image to video generation options
   * @returns Task creation response with taskId
   */
  masterImageToVideo(options: MasterImageToVideoOptions): Promise<TaskResponse>;

  /**
   * Generate video from image using Standard model
   * @param options - Image to video generation options
   * @returns Task creation response with taskId
   */
  standardImageToVideo(
    options: StandardImageToVideoOptions,
  ): Promise<TaskResponse>;

  /**
   * Generate video from image using Pro model
   * @param options - Image to video generation options with optional tail image
   * @returns Task creation response with taskId
   */
  proImageToVideo(options: ProImageToVideoOptions): Promise<TaskResponse>;

  /**
   * Get task record by task ID
   * @param taskId - Task identifier
   * @returns Complete task record with status and results
   */
  getTaskRecord(taskId: string): Promise<ParsedTaskRecord>;
}
