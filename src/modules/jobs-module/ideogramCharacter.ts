import { JobsModule } from "../../common/JobsModule";
import { HttpClient } from "../../core/HttpClient";

export const ideogramCharacter = "ideogram/character" as const;
export const ideogramCharacterEdit = "ideogram/character-edit" as const;
export const ideogramCharacterRemix = "ideogram/character-remix" as const;

interface IdeogramBaseOptions {
  /**
   * The prompt to generate the image
   * - Max length: 5000 characters
   */
  prompt: string;
  /**
   * The rendering speed to use
   * - TURBO: Fastest generation
   * - BALANCED: Balance between speed and quality
   * - QUALITY: Highest quality
   * @default "BALANCED"
   */
  rendering_speed?: "TURBO" | "BALANCED" | "QUALITY";
  /**
   * The style type to generate with
   * - AUTO: Automatic style selection
   * - REALISTIC: Realistic style
   * - FICTION: Fiction/artistic style
   * @default "AUTO"
   */
  style?: "AUTO" | "REALISTIC" | "FICTION";
  /**
   * Determine if MagicPrompt should be used in generating the request
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

export interface IdeogramCharacterOptions extends IdeogramBaseOptions {
  /**
   * A set of images to use as character references
   * - Currently only 1 image is supported
   * - Max size: 10MB
   * - Accepted types: image/jpeg, image/png, image/webp
   */
  reference_image_urls: string[];
  /**
   * The resolution of the generated image
   * @default "square_hd"
   */
  image_size?: "square" | "square_hd" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  /**
   * Description of what to exclude from an image
   * - Max length: 5000 characters
   * @default ""
   */
  negative_prompt?: string;
}

export interface IdeogramCharacterEditOptions extends IdeogramBaseOptions {
  /**
   * The image URL to generate an image from
   * - Needs to match the dimensions of the mask
   * - Max size: 10MB
   * - Accepted types: image/jpeg, image/png, image/webp
   */
  image_url: string;
  /**
   * The mask URL to inpaint the image
   * - Needs to match the dimensions of the input image
   * - Max size: 10MB
   * - Accepted types: image/jpeg, image/png, image/webp
   */
  mask_url: string;
  /**
   * A set of images to use as character references
   * - Currently only 1 image is supported
   * - Max size: 10MB
   * - Accepted types: image/jpeg, image/png, image/webp
   */
  reference_image_urls: string[];
}

export interface IdeogramCharacterRemixOptions extends IdeogramBaseOptions {
  /**
   * The image URL to remix
   * - Max size: 10MB
   * - Accepted types: image/jpeg, image/png, image/webp
   */
  image_url: string;
  /**
   * A set of images to use as character references
   * - Currently only 1 image is supported
   * - Max size: 10MB
   * - Accepted types: image/jpeg, image/png, image/webp
   */
  reference_image_urls: string[];
  /**
   * The resolution of the generated image
   * @default "square_hd"
   */
  image_size?: "square" | "square_hd" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  /**
   * Strength of the input image in the remix
   * - Range: 0.1 - 1 (step: 0.1)
   * @default 0.8
   */
  strength?: number;
  /**
   * Description of what to exclude from an image
   * - Max length: 500 characters
   * @default ""
   */
  negative_prompt?: string;
  /**
   * A set of images to use as style references
   * - Max total size: 10MB
   * - Accepted types: image/jpeg, image/png, image/webp
   */
  image_urls?: string[];
  /**
   * A set of masks to apply to the character references
   * - Currently only 1 mask is supported
   * - Max size: 10MB
   * - Accepted types: image/jpeg, image/png, image/webp
   */
  reference_mask_urls?: string;
}

export interface IdeogramGenerateResult {
  resultUrls: string[];
}

export function createIdeogramCharacterModules(httpClient: HttpClient) {
  const modules = {
    character: new JobsModule<
      IdeogramCharacterOptions,
      IdeogramGenerateResult,
      typeof ideogramCharacter
    >(ideogramCharacter, httpClient),
    characterEdit: new JobsModule<
      IdeogramCharacterEditOptions,
      IdeogramGenerateResult,
      typeof ideogramCharacterEdit
    >(ideogramCharacterEdit, httpClient),
    characterRemix: new JobsModule<
      IdeogramCharacterRemixOptions,
      IdeogramGenerateResult,
      typeof ideogramCharacterRemix
    >(ideogramCharacterRemix, httpClient),

    verifyCallback(callbackData: unknown) {
      const data = callbackData as any;
      const model = data?.data?.model;

      switch (model) {
        case ideogramCharacter:
          return modules.character.verifyCallback(callbackData);
        case ideogramCharacterEdit:
          return modules.characterEdit.verifyCallback(callbackData);
        case ideogramCharacterRemix:
          return modules.characterRemix.verifyCallback(callbackData);
        default:
          return modules.character.verifyCallback(callbackData);
      }
    },
  } as const;

  return modules;
}