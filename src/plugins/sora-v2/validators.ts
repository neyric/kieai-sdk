/**
 * Sora 2 Plugin Parameter Validators
 */

import { createValidationError } from '../../core/errors';
import type {
  BaseVideoOptions,
  TextToVideoOptions,
  ImageToVideoOptions,
  ModelMode,
  Size,
  AspectRatio,
  NFrames,
} from './api';

/**
 * Validate model mode
 */
function validateMode(mode: ModelMode | undefined): void {
  if (mode !== undefined) {
    const validModes: ModelMode[] = ['standard', 'pro'];
    if (!validModes.includes(mode)) {
      throw createValidationError('mode must be either "standard" or "pro"', {
        field: 'mode',
        value: mode,
        validValues: validModes,
      });
    }
  }
}

/**
 * Validate size
 */
function validateSize(size: Size | undefined): void {
  if (size !== undefined) {
    const validSizes: Size[] = ['standard', 'high'];
    if (!validSizes.includes(size)) {
      throw createValidationError('size must be either "standard" or "high"', {
        field: 'size',
        value: size,
        validValues: validSizes,
      });
    }
  }
}

/**
 * Validate aspect ratio
 */
function validateAspectRatio(aspectRatio: AspectRatio | undefined): void {
  if (aspectRatio !== undefined) {
    const validRatios: AspectRatio[] = ['portrait', 'landscape'];
    if (!validRatios.includes(aspectRatio)) {
      throw createValidationError('aspect_ratio must be either "portrait" or "landscape"', {
        field: 'aspect_ratio',
        value: aspectRatio,
        validValues: validRatios,
      });
    }
  }
}

/**
 * Validate n_frames
 */
function validateNFrames(nFrames: NFrames | undefined): void {
  if (nFrames !== undefined) {
    const validFrames: NFrames[] = ['10', '15'];
    if (!validFrames.includes(nFrames)) {
      throw createValidationError('n_frames must be either "10" or "15"', {
        field: 'n_frames',
        value: nFrames,
        validValues: validFrames,
      });
    }
  }
}

/**
 * Validate base video generation options
 */
export function validateBaseVideoOptions(options: BaseVideoOptions): void {
  // Validate mode (optional)
  validateMode(options.mode);

  // Validate prompt (required)
  if (!options.prompt) {
    throw createValidationError('prompt is required', { field: 'prompt' });
  }

  if (typeof options.prompt !== 'string' || options.prompt.trim() === '') {
    throw createValidationError('prompt must be a non-empty string', {
      field: 'prompt',
      value: options.prompt,
    });
  }

  if (options.prompt.length > 10000) {
    throw createValidationError('prompt must not exceed 10000 characters', {
      field: 'prompt',
      length: options.prompt.length,
      maxLength: 10000,
    });
  }

  // Validate aspect_ratio (optional)
  validateAspectRatio(options.aspect_ratio);

  // Validate n_frames (optional)
  validateNFrames(options.n_frames);

  // Validate size (optional)
  validateSize(options.size);

  // Validate remove_watermark (optional)
  if (options.remove_watermark !== undefined) {
    if (typeof options.remove_watermark !== 'boolean') {
      throw createValidationError('remove_watermark must be a boolean', {
        field: 'remove_watermark',
        value: options.remove_watermark,
      });
    }
  }

  // Validate callBackUrl (optional)
  if (options.callBackUrl !== undefined) {
    if (typeof options.callBackUrl !== 'string' || !options.callBackUrl.startsWith('http')) {
      throw createValidationError('callBackUrl must be a valid HTTP URL', {
        field: 'callBackUrl',
        value: options.callBackUrl,
      });
    }
  }
}

/**
 * Validate text-to-video generation options
 */
export function validateTextToVideoOptions(options: TextToVideoOptions): void {
  // Validate base options
  validateBaseVideoOptions(options);
}

/**
 * Validate image-to-video generation options
 */
export function validateImageToVideoOptions(options: ImageToVideoOptions): void {
  // Validate base options
  validateBaseVideoOptions(options);

  // Validate image_urls (required)
  if (!options.image_urls) {
    throw createValidationError('image_urls is required', {
      field: 'image_urls',
    });
  }

  if (!Array.isArray(options.image_urls)) {
    throw createValidationError('image_urls must be an array', {
      field: 'image_urls',
      value: options.image_urls,
    });
  }

  if (options.image_urls.length === 0) {
    throw createValidationError('image_urls must not be empty', {
      field: 'image_urls',
    });
  }

  // Validate each URL in the array
  options.image_urls.forEach((url, index) => {
    if (typeof url !== 'string' || !url.startsWith('http')) {
      throw createValidationError(
        `image_urls[${index}] must be a valid HTTP URL`,
        {
          field: `image_urls[${index}]`,
          value: url,
        }
      );
    }
  });
}

/**
 * Validate task ID
 */
export function validateTaskId(taskId: string): void {
  if (!taskId) {
    throw createValidationError('taskId is required', { field: 'taskId' });
  }

  if (typeof taskId !== 'string' || taskId.trim() === '') {
    throw createValidationError('taskId must be a non-empty string', {
      field: 'taskId',
      value: taskId,
    });
  }
}
