import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const v21MasterT2V = "kling/v2-1-master-text-to-video" as const;
export const v21MasterI2V = "kling/v2-1-master-image-to-video" as const;
export const v21Standard = "kling/v2-1-standard" as const;
export const v21Pro = "kling/v2-1-pro" as const;

interface KlingVideoGenerateOptions {
  /**
   * The text prompt describing the video you want to generate
   * - Max length: 5000 characters
   * @example "First-person view from a soldier jumping from a transport plane — the camera shakes with turbulence, oxygen mask reflections flicker — as the clouds part, the battlefield below pulses with anti-air fire and missile trails."
   */
  prompt: string;
  /**
   * The duration of the generated video in seconds
   * - "5": 5 seconds
   * - "10": 10 seconds
   * @default "5"
   */
  duration?: "5" | "10";
  /**
   * The aspect ratio of the generated video frame
   * - "16:9": 16:9
   * - "9:16": 9:16
   * - "1:1": 1:1
   * @default "16:9"
   */
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  /**
   * Elements to avoid in the generated video
   * - Max length: 500 characters
   * @default "blur, distort, and low quality"
   */
  negative_prompt?: string;
  /**
   * The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt
   * - Range: 0 - 1 (step: 0.1)
   * @default 0.5
   */
  cfg_scale?: number;
}

export interface KlingT2VGenerateOptions extends KlingVideoGenerateOptions {}

export interface KlingI2VGenerateOptions extends Omit<KlingVideoGenerateOptions, "aspect_ratio"> {
  /**
   * URL of the image to be used for the video
   * - Max file size: 10MB
   * - Accepted file types: image/jpeg, image/png, image/webp
   * @example "https://file.aiquickdraw.com/custom-page/akr/section-images/1755256297923kmjpynul.png"
   */
  image_url: string;
}

export interface KlingProGenerateOptions extends KlingI2VGenerateOptions {
  /**
   * URL of the image to be used for the end of the video
   * - Max file size: 10MB
   * - Accepted file types: image/jpeg, image/png, image/webp
   * @default ""
   */
  tail_image_url?: string;
}

export interface KlingGenerateResult {
  resultUrls: string[];
}

export function createKlingModules(httpClient: HttpClient) {
  const modules = {
    v21MasterT2V: new JobsModule<
      KlingT2VGenerateOptions,
      KlingGenerateResult,
      typeof v21MasterT2V
    >(v21MasterT2V, httpClient),
    v21MasterI2V: new JobsModule<
      KlingI2VGenerateOptions,
      KlingGenerateResult,
      typeof v21MasterI2V
    >(v21MasterI2V, httpClient),
    v21Standard: new JobsModule<
      KlingI2VGenerateOptions,
      KlingGenerateResult,
      typeof v21Standard
    >(v21Standard, httpClient),
    v21Pro: new JobsModule<
      KlingProGenerateOptions,
      KlingGenerateResult,
      typeof v21Pro
    >(v21Pro, httpClient),

    verifyCallback(callbackData: unknown) {
      const data = callbackData as any;
      const model = data?.data?.model;

      switch (model) {
        case v21MasterT2V:
          return modules.v21MasterT2V.verifyCallback(callbackData);
        case v21MasterI2V:
          return modules.v21MasterI2V.verifyCallback(callbackData);
        case v21Standard:
          return modules.v21Standard.verifyCallback(callbackData);
        case v21Pro:
          return modules.v21Pro.verifyCallback(callbackData);
        default:
          return modules.v21MasterT2V.verifyCallback(callbackData);
      }
    },
  } as const;

  return modules;
}