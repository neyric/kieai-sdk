/**
 * Kling V2.1 Plugin Parameter Validators
 */

import { createValidationError } from '../../core/errors';
import type {
  BaseVideoOptions,
  MasterTextToVideoOptions,
  MasterImageToVideoOptions,
  StandardImageToVideoOptions,
  ProImageToVideoOptions,
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
 * Validate image URL
 */
function validateImageUrl(url: string | undefined, field: string, required: boolean): void {
  if (required && !url) {
    throw createValidationError(`${field} is required`, { field });
  }

  if (url !== undefined) {
    if (typeof url !== 'string' || !url.startsWith('http')) {
      throw createValidationError(`${field} must be a valid HTTP URL`, {
        field,
        value: url,
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

  if (options.prompt.length > 5000) {
    throw createValidationError('prompt must not exceed 5000 characters', {
      field: 'prompt',
      length: options.prompt.length,
      maxLength: 5000,
    });
  }

  // Validate duration
  validateDuration(options.duration);

  // Validate negative_prompt
  if (options.negative_prompt !== undefined) {
    if (typeof options.negative_prompt !== 'string') {
      throw createValidationError('negative_prompt must be a string', {
        field: 'negative_prompt',
        value: options.negative_prompt,
      });
    }

    if (options.negative_prompt.length > 500) {
      throw createValidationError('negative_prompt must not exceed 500 characters', {
        field: 'negative_prompt',
        length: options.negative_prompt.length,
        maxLength: 500,
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
 * Validate Master Text-to-Video generation options
 */
export function validateMasterTextToVideoOptions(options: MasterTextToVideoOptions): void {
  // Validate base options
  validateBaseVideoOptions(options);

  // Validate aspect_ratio (optional)
  validateAspectRatio(options.aspect_ratio);
}

/**
 * Validate Master Image-to-Video generation options
 */
export function validateMasterImageToVideoOptions(options: MasterImageToVideoOptions): void {
  // Validate base options
  validateBaseVideoOptions(options);

  // Validate image_url (required)
  validateImageUrl(options.image_url, 'image_url', true);
}

/**
 * Validate Standard Image-to-Video generation options
 */
export function validateStandardImageToVideoOptions(options: StandardImageToVideoOptions): void {
  // Validate base options
  validateBaseVideoOptions(options);

  // Validate image_url (required)
  validateImageUrl(options.image_url, 'image_url', true);
}

/**
 * Validate Pro Image-to-Video generation options
 */
export function validateProImageToVideoOptions(options: ProImageToVideoOptions): void {
  // Validate base options
  validateBaseVideoOptions(options);

  // Validate image_url (required)
  validateImageUrl(options.image_url, 'image_url', true);

  // Validate tail_image_url (optional)
  validateImageUrl(options.tail_image_url, 'tail_image_url', false);
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
