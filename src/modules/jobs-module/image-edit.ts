import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const qwenImageEdit = "qwen/image-edit" as const;

interface ImageEditGenerateResult {
  resultUrls: string[];
}

export interface ImageEditGenerateOptions {
  /**
   * The prompt to generate the image with
   * Max length: 2000 characters
   */
  prompt: string;
  /**
   * The URL of the image to edit
   * Max file size: 10MB
   * Accepted types: image/jpeg, image/png, image/webp
   */
  image_url: string;
  /**
   * Acceleration level for image generation
   * Options: 'none', 'regular', 'high'
   * @default "none"
   */
  acceleration?: "none" | "regular" | "high";
  /**
   * The size of the generated image
   * @default "landscape_4_3"
   */
  image_size?: "square" | "square_hd" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  /**
   * The number of inference steps to perform
   * Range: 2 - 49
   * @default 25
   */
  num_inference_steps?: number;
  /**
   * The same seed and the same prompt given to the same version of the model will output the same image every time
   */
  seed?: number;
  /**
   * The CFG (Classifier Free Guidance) scale
   * Range: 0 - 20 (step: 0.1)
   * @default 4
   */
  guidance_scale?: number;
  /**
   * If set to true, the function will wait for the image to be generated and uploaded before returning the response
   * @default false
   */
  sync_mode?: boolean;
  /**
   * Number of images to generate
   * Options: "1", "2", "3", "4"
   */
  num_images?: "1" | "2" | "3" | "4";
  /**
   * If set to true, the safety checker will be enabled
   * @default true
   */
  enable_safety_checker?: boolean;
  /**
   * The format of the generated image
   * @default "png"
   */
  output_format?: "jpeg" | "png";
  /**
   * The negative prompt for the generation
   * Max length: 500 characters
   * @default "blurry, ugly"
   */
  negative_prompt?: string;
}

export function createImageEditModules(httpClient: HttpClient) {
  const modules = {
    qwenImageEdit: new JobsModule<
      ImageEditGenerateOptions,
      ImageEditGenerateResult,
      typeof qwenImageEdit
    >(qwenImageEdit, httpClient),

    verifyCallback(callbackData: unknown) {
      return modules.qwenImageEdit.verifyCallback(callbackData);
    },
  } as const;

  return modules;
}