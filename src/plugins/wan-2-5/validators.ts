/**
 * Wan 2.5 Plugin Parameter Validators
 */

import { createValidationError } from '../../core/errors';
import type {
  BaseVideoOptions,
  TextToVideoOptions,
  ImageToVideoOptions,
  VideoResolution,
  VideoDuration,
  AspectRatio,
} from './api';

/**
 * Validate video resolution
 */
function validateResolution(resolution: VideoResolution | undefined): void {
  if (resolution !== undefined) {
    const validResolutions: VideoResolution[] = ['720p', '1080p'];
    if (!validResolutions.includes(resolution)) {
      throw createValidationError('resolution must be one of: 720p, 1080p', {
        field: 'resolution',
        value: resolution,
        validValues: validResolutions,
      });
    }
  }
}

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

  if (options.prompt.length > 800) {
    throw createValidationError('prompt must not exceed 800 characters', {
      field: 'prompt',
      length: options.prompt.length,
      maxLength: 800,
    });
  }

  // Validate duration
  validateDuration(options.duration);

  // Validate resolution
  validateResolution(options.resolution);

  // Validate negative_prompt (optional)
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

  // Validate enable_prompt_expansion (optional)
  if (options.enable_prompt_expansion !== undefined) {
    if (typeof options.enable_prompt_expansion !== 'boolean') {
      throw createValidationError('enable_prompt_expansion must be a boolean', {
        field: 'enable_prompt_expansion',
        value: options.enable_prompt_expansion,
      });
    }
  }

  // Validate seed (optional)
  if (options.seed !== undefined) {
    if (typeof options.seed !== 'number') {
      throw createValidationError('seed must be a number', {
        field: 'seed',
        value: options.seed,
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
