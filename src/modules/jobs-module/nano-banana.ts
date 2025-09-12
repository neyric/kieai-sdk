import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const nanoBanana = "google/nano-banana" as const;
export const nanoBananaEdit = "google/nano-banana-edit" as const;
export const nanoBananaUpscale = "nano-banana-upscale" as const;

/**
 * Nano Banana image generation options
 */
export interface NanoBananaGenerateOptions {
  /**
   * The prompt for image generation
   * - Max length: 5000 characters
   * @example "A surreal painting of a giant banana floating in space, stars and galaxies in the background, vibrant colors, digital art"
   */
  prompt: string;
  /**
   * Output format for the images
   * - png: PNG
   * - jpeg: JPEG
   * @default "png"
   */
  output_format?: "png" | "jpeg";
  /**
   * Auto (default) is native resolution, while any other aspect ratio invokes an external reframe api and costs extra credits
   * - auto: Auto
   * - 1:1: Square
   * - 3:4: Portrait 3:4
   * - 9:16: Portrait 9:16
   * - 4:3: Landscape 4:3
   * - 16:9: Landscape 16:9
   * @default "auto"
   */
  image_size?: "auto" | "1:1" | "3:4" | "9:16" | "4:3" | "16:9";
}

/**
 * Nano Banana Edit image editing options
 */
export interface NanoBananaEditGenerateOptions
  extends NanoBananaGenerateOptions {
  /**
   * List of URLs of input images for editing, up to 5 images
   * - File URL after upload, not file content
   * - Accepted types: image/jpeg, image/png, image/webp
   * - Max size: 10MB
   */
  image_urls: string[];
}

/**
 * Nano Banana Upscale options
 */
export interface NanoBananaUpscaleOptions {
  /**
   * Input image
   * - File URL after upload, not file content
   * - Accepted types: image/jpeg, image/png, image/webp
   * - Max size: 10MB
   * @example "https://file.aiquickdraw.com/custom-page/akr/section-images/17574044692533swb9nb5.jpeg"
   */
  image: string;
  /**
   * Factor to scale image by
   * - Range: 1 - 4 (step: 1)
   * @default 2
   */
  scale?: number;
  /**
   * Run GFPGAN face enhancement along with upscaling
   * @default false
   */
  face_enhance?: boolean;
}

/**
 * Result interface for all Nano Banana models
 */
export interface NanoBananaGenerateResult {
  resultUrls: string[];
}

export function createNanoBananaModules(httpClient: HttpClient) {
  const modules = {
    generate: new JobsModule<
      NanoBananaGenerateOptions,
      NanoBananaGenerateResult,
      typeof nanoBanana
    >(nanoBanana, httpClient),

    edit: new JobsModule<
      NanoBananaEditGenerateOptions,
      NanoBananaGenerateResult,
      typeof nanoBananaEdit
    >(nanoBananaEdit, httpClient),

    upscale: new JobsModule<
      NanoBananaUpscaleOptions,
      NanoBananaGenerateResult,
      typeof nanoBananaUpscale
    >(nanoBananaUpscale, httpClient),

    verifyCallback(callbackData: unknown) {
      const data = callbackData as any;
      const model = data?.data?.model;

      switch (model) {
        case nanoBanana:
          return modules.generate.verifyCallback(callbackData);
        case nanoBananaEdit:
          return modules.edit.verifyCallback(callbackData);
        case nanoBananaUpscale:
          return modules.upscale.verifyCallback(callbackData);
        default:
          throw Error("Unvalid model type");
      }
    },
  } as const;

  return modules;
}
