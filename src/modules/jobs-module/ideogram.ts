import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const v3TextToImage = "ideogram/v3-text-to-image" as const;
export const v3Edit = "ideogram/v3-edit" as const;
export const v3Remix = "ideogram/v3-remix" as const;

interface IdeogramGenerateResult {
  resultUrls: string[];
}

interface IdeogramBaseOptions {
  /**
   * The rendering speed to use
   * @default "BALANCED"
   */
  rendering_speed?: "TURBO" | "BALANCED" | "QUALITY";
  /**
   * Determine if MagicPrompt should be used in generating the request or not
   * @default true
   */
  expand_prompt?: boolean;
  /**
   * Number of images to generate
   * @default "1"
   */
  num_images?: "1" | "2" | "3" | "4";
  /**
   * Seed for the random number generator
   */
  seed?: number;
}

export interface IdeogramV3TextToImageOptions extends IdeogramBaseOptions {
  /**
   * Description of the image to generate
   * Max length: 5000 characters
   */
  prompt: string;
  /**
   * The style type to generate with. Cannot be used with style_codes.
   * @default "AUTO"
   */
  style?: "AUTO" | "GENERAL" | "REALISTIC" | "DESIGN";
  /**
   * The resolution of the generated image
   * @default "square_hd"
   */
  image_size?: "square" | "square_hd" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  /**
   * If set to true, the function will wait for the image to be generated and uploaded before returning the response
   * @default false
   */
  sync_mode?: boolean;
  /**
   * Description of what to exclude from an image
   * Max length: 5000 characters
   * @default ""
   */
  negative_prompt?: string;
}

export interface IdeogramV3EditOptions extends IdeogramBaseOptions {
  /**
   * The prompt to fill the masked part of the image
   * Max length: 5000 characters
   */
  prompt: string;
  /**
   * The image URL to generate an image from. Needs to match the dimensions of the mask.
   * Max file size: 10MB
   * Accepted types: image/jpeg, image/png, image/webp
   */
  image_url: string;
  /**
   * The mask URL to inpaint the image. Needs to match the dimensions of the input image.
   * Max file size: 10MB
   * Accepted types: image/jpeg, image/png, image/webp
   */
  mask_url: string;
}

export interface IdeogramV3RemixOptions extends IdeogramBaseOptions {
  /**
   * The prompt to remix the image with
   * Max length: 5000 characters
   */
  prompt: string;
  /**
   * The image URL to remix
   * Max file size: 10MB
   * Accepted types: image/jpeg, image/png, image/webp
   */
  image_url: string;
  /**
   * The style type to generate with. Cannot be used with style_codes.
   * @default "AUTO"
   */
  style?: "AUTO" | "GENERAL" | "REALISTIC" | "DESIGN";
  /**
   * The resolution of the generated image
   * @default "square_hd"
   */
  image_size?: "square" | "square_hd" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  /**
   * Strength of the input image in the remix
   * Range: 0.01 - 1 (step: 0.01)
   * @default 0.8
   */
  strength?: number;
  /**
   * Description of what to exclude from an image
   * Max length: 5000 characters
   * @default ""
   */
  negative_prompt?: string;
}

export function createIdeogramModules(httpClient: HttpClient) {
  const modules = {
    v3TextToImage: new JobsModule<
      IdeogramV3TextToImageOptions,
      IdeogramGenerateResult,
      typeof v3TextToImage
    >(v3TextToImage, httpClient),
    v3Edit: new JobsModule<
      IdeogramV3EditOptions,
      IdeogramGenerateResult,
      typeof v3Edit
    >(v3Edit, httpClient),
    v3Remix: new JobsModule<
      IdeogramV3RemixOptions,
      IdeogramGenerateResult,
      typeof v3Remix
    >(v3Remix, httpClient),

    verifyCallback(callbackData: unknown) {
      const data = callbackData as any;
      const model = data?.data?.model;

      switch (model) {
        case v3TextToImage:
          return modules.v3TextToImage.verifyCallback(callbackData);
        case v3Edit:
          return modules.v3Edit.verifyCallback(callbackData);
        case v3Remix:
          return modules.v3Remix.verifyCallback(callbackData);
        default:
          return modules.v3TextToImage.verifyCallback(callbackData);
      }
    },
  } as const;

  return modules;
}