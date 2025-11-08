/**
 * Wan 2.2 Turbo Plugin API Interface
 * Wan 2.2 A14b video generation API (Turbo models)
 */

/**
 * Video resolution options
 */
export type VideoResolution = "480p" | "580p" | "720p";

/**
 * Video aspect ratio for text-to-video
 */
export type AspectRatio = "16:9" | "9:16" | "1:1";

/**
 * Video aspect ratio for image-to-video (includes auto option)
 */
export type ImageAspectRatio = "auto" | "16:9" | "9:16" | "1:1";

/**
 * Acceleration level
 */
export type Acceleration = "none" | "regular";

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
   * Text prompt to guide video generation
   * Maximum length: 5000 characters
   */
  prompt: string;

  /**
   * Video resolution
   * @default "720p"
   */
  resolution?: VideoResolution;

  /**
   * Enable prompt expansion using LLM
   * @default false
   */
  enable_prompt_expansion?: boolean;

  /**
   * Random seed for reproducibility
   * Use 0 for random
   * Range: 0 - 2147483647
   * @default 0
   */
  seed?: number;

  /**
   * Acceleration level
   * @default "none"
   */
  acceleration?: Acceleration;

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
   * Input image URL
   * Max size: 10MB
   * Supported formats: image/jpeg, image/png, image/webp
   */
  image_url: string;

  /**
   * Video aspect ratio
   * If 'auto', determined from input image
   * @default "auto"
   */
  aspect_ratio?: ImageAspectRatio;
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
 * Wan 2.2 Turbo API Interface
 */
export interface WanV22TurboAPI {
  /**
   * Generate video from image using Turbo model
   * @param options - Image to video generation options
   * @returns Task creation response with taskId
   */
  imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse>;

  /**
   * Generate video from text using Turbo model
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
