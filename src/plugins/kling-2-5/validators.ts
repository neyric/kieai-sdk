/**
 * Kling 2.5 Plugin Parameter Validators
 */

import { createValidationError } from '../../core/errors';
import type {
  BaseVideoOptions,
  TextToVideoOptions,
  ImageToVideoOptions,
  VideoDuration,
  AspectRatio,
} from './api';

/**
 * Validate video duration
 */
function validateDuration(duration: VideoDuration | undefined): void {
  if (duration !== undefined) {
    const validDurations: VideoDuration[] = ['5', '10'];
    if (!validDurations.includes(duration)) {
      throw createValidationError('duration must be either "5" or "10"', {
        field: 'duration',
        value: duration,
        validValues: validDurations,
      });
    }
  }
}

/**
 * Validate aspect ratio
 */
function validateAspectRatio(aspectRatio: AspectRatio | undefined): void {
  if (aspectRatio !== undefined) {
    const validRatios: AspectRatio[] = ['16:9', '9:16', '1:1'];
    if (!validRatios.includes(aspectRatio)) {
      throw createValidationError('aspect_ratio must be one of: 16:9, 9:16, 1:1', {
        field: 'aspect_ratio',
        value: aspectRatio,
        validValues: validRatios,
      });
    }
  }
}

/**
 * Validate CFG scale
 */
function validateCfgScale(cfgScale: number | undefined): void {
  if (cfgScale !== undefined) {
    if (typeof cfgScale !== 'number') {
      throw createValidationError('cfg_scale must be a number', {
        field: 'cfg_scale',
        value: cfgScale,
      });
    }

    if (cfgScale < 0 || cfgScale > 1) {
      throw createValidationError('cfg_scale must be between 0 and 1', {
        field: 'cfg_scale',
        value: cfgScale,
        min: 0,
        max: 1,
      });
    }
  }
}

/**
 * Validate base video generation options
 */
export function validateBaseVideoOptions(options: BaseVideoOptions): void {
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

  if (options.prompt.length > 2500) {
    throw createValidationError('prompt must not exceed 2500 characters', {
      field: 'prompt',
      length: options.prompt.length,
      maxLength: 2500,
    });
  }

  // Validate duration
  validateDuration(options.duration);

  // Validate negative_prompt (optional)
  if (options.negative_prompt !== undefined) {
    if (typeof options.negative_prompt !== 'string') {
      throw createValidationError('negative_prompt must be a string', {
        field: 'negative_prompt',
        value: options.negative_prompt,
      });
    }

    if (options.negative_prompt.length > 2500) {
      throw createValidationError('negative_prompt must not exceed 2500 characters', {
        field: 'negative_prompt',
        length: options.negative_prompt.length,
        maxLength: 2500,
      });
    }
  }

  // Validate cfg_scale
  validateCfgScale(options.cfg_scale);

  // Validate callBackUrl
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

  // Validate aspect_ratio (optional)
  validateAspectRatio(options.aspect_ratio);
}

/**
 * Validate image-to-video generation options
 */
export function validateImageToVideoOptions(options: ImageToVideoOptions): void {
  // Validate base options
  validateBaseVideoOptions(options);

  // Validate image_url (required)
  if (!options.image_url) {
    throw createValidationError('image_url is required', {
      field: 'image_url',
    });
  }

  if (typeof options.image_url !== 'string' || !options.image_url.startsWith('http')) {
    throw createValidationError('image_url must be a valid HTTP URL', {
      field: 'image_url',
      value: options.image_url,
    });
  }
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
