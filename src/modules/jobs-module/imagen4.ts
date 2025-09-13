import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const imagen4 = "google/imagen4" as const;
export const imagen4Ultra = "google/imagen4-ultra" as const;
export const imagen4Fast = "google/imagen4-fast" as const;

interface Imagen4BaseOptions {
  /**
   * The text prompt describing what you want to see
   * - Max length: 5000 characters
   * @example "A lively comic scene where two colleagues are in an office..."
   */
  prompt: string;
  /**
   * A description of what to discourage in the generated images
   * - Max length: 5000 characters
   * @default ""
   */
  negative_prompt?: string;
  /**
   * The aspect ratio of the generated image
   * - Values: "1:1", "16:9", "9:16", "3:4", "4:3"
   * @default "1:1"
   */
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3";
}

export interface Imagen4GenerateOptions extends Imagen4BaseOptions {
  /**
   * Number of images to generate
   * - Values: "1", "2", "3", "4"
   * @default "1"
   */
  num_images?: "1" | "2" | "3" | "4";
  /**
   * Random seed for reproducible generation
   * - Max length: 500 characters
   * @default ""
   */
  seed?: string;
}

export interface Imagen4UltraGenerateOptions extends Imagen4BaseOptions {
  /**
   * Random seed for reproducible generation
   * - Max length: 500 characters
   * @default ""
   */
  seed?: string;
}

export interface Imagen4FastGenerateOptions extends Imagen4BaseOptions {
  /**
   * Number of images to generate
   * - Values: "1", "2", "3", "4"
   * @default "1"
   */
  num_images?: "1" | "2" | "3" | "4";
  /**
   * Random seed for reproducible generation
   */
  seed?: number;
}

export interface Imagen4GenerateResult {
  resultUrls: string[];
}

export function createImagen4Modules(httpClient: HttpClient) {
  const modules = {
    imagen4: new JobsModule<
      Imagen4GenerateOptions,
      Imagen4GenerateResult,
      typeof imagen4
    >(imagen4, httpClient),
    imagen4Ultra: new JobsModule<
      Imagen4UltraGenerateOptions,
      Imagen4GenerateResult,
      typeof imagen4Ultra
    >(imagen4Ultra, httpClient),
    imagen4Fast: new JobsModule<
      Imagen4FastGenerateOptions,
      Imagen4GenerateResult,
      typeof imagen4Fast
    >(imagen4Fast, httpClient),

    verifyCallback(callbackData: unknown) {
      const data = callbackData as any;
      const model = data?.data?.model;

      switch (model) {
        case imagen4:
          return modules.imagen4.verifyCallback(callbackData);
        case imagen4Ultra:
          return modules.imagen4Ultra.verifyCallback(callbackData);
        case imagen4Fast:
          return modules.imagen4Fast.verifyCallback(callbackData);
        default:
          return modules.imagen4.verifyCallback(callbackData);
      }
    },
  } as const;

  return modules;
}