import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const seedreamV4T2I = "bytedance/seedream-v4-text-to-image" as const;
export const seedreamV4Edit = "bytedance/seedream-v4-edit" as const;

/**
 * Seedream V4 base generation options
 */
interface SeedreamV4BaseOptions {
  /**
   * The text prompt used to generate/edit the image
   * - Max length: 5000 characters
   */
  prompt: string;
  /**
   * Image size options
   * - square: Square (512*512)
   * - square_hd: Square HD (1024*1024)
   * - portrait_4_3: Portrait 3:4 (768*1024)
   * - portrait_16_9: Portrait 9:16 (576*1024)
   * - landscape_4_3: Landscape 4:3 (1024*768)
   * - landscape_16_9: Landscape 16:9 (1024*576)
   * @default "square_hd"
   */
  image_size?:
    | "square"
    | "square_hd"
    | "portrait_4_3"
    | "portrait_16_9"
    | "landscape_4_3"
    | "landscape_16_9";
  /**
   * Random seed to control the stochasticity of image generation
   */
  seed?: number;
}

/**
 * Seedream V4 Text to Image generation options
 */
export interface SeedreamV4T2IGenerateOptions extends SeedreamV4BaseOptions {
  // Text to Image doesn't require additional fields beyond base options
}

/**
 * Seedream V4 Edit generation options
 */
export interface SeedreamV4EditGenerateOptions extends SeedreamV4BaseOptions {
  /**
   * List of URLs of input images for editing
   * - File URL after upload, not file content
   * - Accepted types: image/jpeg, image/png, image/webp
   * - Max size: 10MB
   * - Max count: 10 images
   */
  image_urls: string[];
}

/**
 * Seedream generation result
 */
export interface SeedreamGenerateResult {
  resultUrls: string[];
}

export function createSeedreamModules(httpClient: HttpClient) {
  const modules = {
    v4T2I: new JobsModule<
      SeedreamV4T2IGenerateOptions,
      SeedreamGenerateResult,
      typeof seedreamV4T2I
    >(seedreamV4T2I, httpClient),

    v4Edit: new JobsModule<
      SeedreamV4EditGenerateOptions,
      SeedreamGenerateResult,
      typeof seedreamV4Edit
    >(seedreamV4Edit, httpClient),

    verifyCallback(callbackData: unknown) {
      const data = callbackData as any;
      const model = data?.data?.model;

      switch (model) {
        case seedreamV4T2I:
          return modules.v4T2I.verifyCallback(callbackData);
        case seedreamV4Edit:
          return modules.v4Edit.verifyCallback(callbackData);
        default:
          throw Error("Invalid model type");
      }
    },
  } as const;

  return modules;
}