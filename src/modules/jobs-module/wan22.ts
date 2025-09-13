import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const wan22TextToVideoTurbo = "wan/2-2-a14b-text-to-video-turbo" as const;
export const wan22ImageToVideoTurbo = "wan/2-2-a14b-image-to-video-turbo" as const;

interface Wan22VideoBaseOptions {
  /**
   * The text prompt to guide video generation
   * - Max length: 5000 characters
   * @example "Drone shot, fast traversal, starting inside a cracked, frosty circular pipe. The camera bursts upward through the pipe to reveal a vast polar landscape bathed in golden sunrise light."
   */
  prompt: string;
  /**
   * Resolution of the generated video
   * - 480p
   * - 580p
   * - 720p
   * @default "720p"
   */
  resolution?: "480p" | "580p" | "720p";
  /**
   * Whether to enable prompt expansion
   * This will use a large language model to expand the prompt with additional details while maintaining the original meaning
   * @default false
   */
  enable_prompt_expansion?: boolean;
  /**
   * Random seed for reproducibility. If None, a random seed is chosen
   * - Range: 0 - 2147483647
   * @default 0
   */
  seed?: number;
  /**
   * Acceleration level to use. The more acceleration, the faster the generation, but with lower quality
   * The recommended value is 'none'
   * - none
   * - regular
   * @default "none"
   */
  acceleration?: "none" | "regular";
}

export interface Wan22TextToVideoOptions extends Wan22VideoBaseOptions {
  /**
   * Aspect ratio of the generated video
   * - 16:9
   * - 9:16
   * - 1:1
   * @default "16:9"
   */
  aspect_ratio?: "16:9" | "9:16" | "1:1";
}

export interface Wan22ImageToVideoOptions extends Wan22VideoBaseOptions {
  /**
   * URL of the input image. If the input image does not match the chosen aspect ratio, it is resized and center cropped
   * - Max file size: 10MB
   * - Accepted file types: image/jpeg, image/png, image/webp
   */
  image_url: string;
  /**
   * Aspect ratio of the generated video. If 'auto', the aspect ratio will be determined automatically based on the input image
   * @default "auto"
   */
  aspect_ratio?: "auto" | "16:9" | "9:16" | "1:1";
}

export interface Wan22VideoResult {
  resultUrls: string[];
}

export function createWan22Modules(httpClient: HttpClient) {
  const modules = {
    textToVideoTurbo: new JobsModule<
      Wan22TextToVideoOptions,
      Wan22VideoResult,
      typeof wan22TextToVideoTurbo
    >(wan22TextToVideoTurbo, httpClient),
    
    imageToVideoTurbo: new JobsModule<
      Wan22ImageToVideoOptions,
      Wan22VideoResult,
      typeof wan22ImageToVideoTurbo
    >(wan22ImageToVideoTurbo, httpClient),

    verifyCallback(callbackData: unknown) {
      const data = callbackData as any;
      const model = data?.data?.model;

      switch (model) {
        case wan22TextToVideoTurbo:
          return modules.textToVideoTurbo.verifyCallback(callbackData);
        case wan22ImageToVideoTurbo:
          return modules.imageToVideoTurbo.verifyCallback(callbackData);
        default:
          return modules.textToVideoTurbo.verifyCallback(callbackData);
      }
    },
  } as const;

  return modules;
}