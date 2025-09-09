import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const v1ProI2V = "bytedance/v1-pro-image-to-video" as const;
export const v1ProT2V = "bytedance/v1-pro-text-to-video" as const;
export const v1LiteI2V = "bytedance/v1-lite-image-to-video" as const;
export const v1LiteT2V = "bytedance/v1-lite-text-to-video" as const;

interface SeeDanceVideoGenerateOptions {
  /**
   * The text prompt used to generate the video
   * - Max length: 10000 characters
   * @example "Multiple shots. A traveler crosses an endless desert toward a glowing archway. [Cut to] His cloak whips in the wind as he reaches the massive stone threshold. [Wide shot] He steps through — and vanishes into a burst of light"
   */
  prompt: string;
  /**
   * Video resolution - 480p for faster generation, 720p for higher quality
   * - 480p
   * - 720p
   * - 1080p
   */
  resolution?: "480p" | "720p" | "1080p";
  /**
   * Duration of the video in seconds
   * - string of "3" - "12"
   * @default "5"
   *  */
  duration?: "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
  /** Whether to fixed the camera position */
  camera_fixed?: boolean;
  /** Random seed to control video generation. Use -1 for random */
  seed?: number;
  /**
   * The safety checker is always enabled in Playground. It can only be disabled by setting false through the API
   * @default true
   */
  enable_safety_checker?: boolean;
}

export interface SeeDanceI2VGenerateOptions
  extends SeeDanceVideoGenerateOptions {
  /**
   * The URL of the image used to generate video
   * - File URL after upload, not file content; Accepted types: image/jpeg, image/png, image/webp; Max size: 10.0MB
   */
  image_url: string;
  /**
   * The URL of the image the video ends with. Defaults to None
   * - File URL after upload, not file content; Accepted types: image/jpeg, image/png, image/webp; Max size: 10.0MB
   */
  end_image_url?: string;
}

export interface SeeDanceT2VGenerateOptions
  extends SeeDanceVideoGenerateOptions {
  /**
   * The aspect ratio of the generated video
   * - Values: "16:9", "4:3", "1:1", "3:4", "9:16", "9:21"
   * @default "16:9"
   */
  aspect_ratio?: "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";
}

export interface SeeDanceGenerateResult {
  resultUrls: string[];
}

export function createSeeDanceModules(httpClient: HttpClient) {
  const modules = {
    v1ProI2V: new JobsModule<
      SeeDanceI2VGenerateOptions,
      SeeDanceGenerateResult,
      typeof v1ProI2V
    >(v1ProI2V, httpClient),
    v1ProT2V: new JobsModule<
      SeeDanceT2VGenerateOptions,
      SeeDanceGenerateResult,
      typeof v1ProT2V
    >(v1ProT2V, httpClient),
    v1LiteI2V: new JobsModule<
      SeeDanceI2VGenerateOptions,
      SeeDanceGenerateResult,
      typeof v1LiteI2V
    >(v1LiteI2V, httpClient),
    v1LiteT2V: new JobsModule<
      SeeDanceT2VGenerateOptions,
      SeeDanceGenerateResult,
      typeof v1LiteT2V
    >(v1LiteT2V, httpClient),

    verifyCallback(callbackData: unknown) {
      const data = callbackData as any;
      const model = data?.data?.model;

      switch (model) {
        case v1ProI2V:
          return modules.v1ProI2V.verifyCallback(callbackData);
        case v1ProT2V:
          return modules.v1ProT2V.verifyCallback(callbackData);
        case v1LiteI2V:
          return modules.v1LiteI2V.verifyCallback(callbackData);
        case v1LiteT2V:
          return modules.v1LiteT2V.verifyCallback(callbackData);
        default:
          return modules.v1ProI2V.verifyCallback(callbackData);
      }
    },
  } as const;

  return modules;
}
