/**
 * Sora 2 Plugin API Interface
 * OpenAI Sora 2 video generation API
 */

/**
 * Model mode selection
 */
export type ModelMode = "standard" | "pro";

/**
 * Video quality/size
 */
export type Size = "standard" | "high";

/**
 * Video aspect ratio
 */
export type AspectRatio = "portrait" | "landscape";

/**
 * Video duration in frames
 */
export type NFrames = "10" | "15";

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
   * Model mode: standard (Sora 2) or pro (Sora 2 Pro)
   * @default "standard"
   */
  mode?: ModelMode;

  /**
   * Text prompt describing the desired video
   * Maximum length: 10000 characters
   */
  prompt: string;

  /**
   * Video aspect ratio
   * @default "landscape"
   */
  aspect_ratio?: AspectRatio;

  /**
   * Number of frames (duration)
   * @default "10"
   */
  n_frames?: NFrames;

  /**
   * Video quality/size (only for Pro mode)
   * @default "high" for text-to-video, "standard" for image-to-video
   */
  size?: Size;

  /**
   * Remove watermark from generated video
   * @default true
   */
  remove_watermark?: boolean;

  /**
   * Callback URL for task completion notifications
   * If provided, system sends POST requests when task completes
   */
  callBackUrl?: string;
}

/**
 * Text-to-Video generation options
 */
export interface TextToVideoOptions extends BaseVideoOptions {}

/**
 * Image-to-Video generation options
 */
export interface ImageToVideoOptions extends BaseVideoOptions {
  /**
   * Array of image URLs to use as first frame
   * Must be publicly accessible
   * Supported formats: image/jpeg, image/png, image/webp
   * Max file size: 10MB
   */
  image_urls: string[];
}

/**
 * Task creation response
 */
export interface TaskResponse {
  /** Task ID for querying status */
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
  /** Generation result JSON string (null if not completed) */
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
 * Parsed task record with structured data
 */
export interface ParsedTaskRecord
  extends Omit<TaskRecord, "param" | "resultJson"> {
  /** Parsed request parameters */
  param: Record<string, any>;
  /** Parsed generation result (null if not completed) */
  result: VideoResult | null;
  /** Original JSON string */
  resultJson: string | null;
}

/**
 * Sora 2 API Interface
 */
export interface SoraV2API {
  /**
   * Generate video from text prompt
   * @param options - Text to video generation options
   * @returns Task creation response with taskId
   */
  textToVideo(options: TextToVideoOptions): Promise<TaskResponse>;

  /**
   * Generate video from image and text prompt
   * @param options - Image to video generation options
   * @returns Task creation response with taskId
   */
  imageToVideo(options: ImageToVideoOptions): Promise<TaskResponse>;

  /**
   * Get task record by task ID
   * @param taskId - Task identifier
   * @returns Complete task record with status and results
   */
  getTaskRecord(taskId: string): Promise<ParsedTaskRecord>;
}
