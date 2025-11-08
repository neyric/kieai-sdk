/**
 * Wan 2.2 Turbo Plugin Parameter Validators
 */

import { createValidationError } from '../../core/errors';
import type {
  BaseVideoOptions,
  ImageToVideoOptions,
  TextToVideoOptions,
  VideoResolution,
  AspectRatio,
  ImageAspectRatio,
  Acceleration,
} from './api';

/**
 * Validate video resolution
 */
function validateResolution(resolution: VideoResolution | undefined): void {
  if (resolution !== undefined) {
    const validResolutions: VideoResolution[] = ['480p', '580p', '720p'];
    if (!validResolutions.includes(resolution)) {
      throw createValidationError('resolution must be one of: 480p, 580p, 720p', {
        field: 'resolution',
        value: resolution,
        validValues: validResolutions,
      });
    }
  }
}

/**
 * Validate aspect ratio for text-to-video
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
 * Validate aspect ratio for image-to-video
 */
function validateImageAspectRatio(aspectRatio: ImageAspectRatio | undefined): void {
  if (aspectRatio !== undefined) {
    const validRatios: ImageAspectRatio[] = ['auto', '16:9', '9:16', '1:1'];
    if (!validRatios.includes(aspectRatio)) {
      throw createValidationError(
        'aspect_ratio must be one of: auto, 16:9, 9:16, 1:1',
        {
          field: 'aspect_ratio',
          value: aspectRatio,
          validValues: validRatios,
        }
      );
    }
  }
}

/**
 * Validate acceleration
 */
function validateAcceleration(acceleration: Acceleration | undefined): void {
  if (acceleration !== undefined) {
    const validAccelerations: Acceleration[] = ['none', 'regular'];
    if (!validAccelerations.includes(acceleration)) {
      throw createValidationError('acceleration must be one of: none, regular', {
        field: 'acceleration',
        value: acceleration,
        validValues: validAccelerations,
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

  // Validate resolution
  validateResolution(options.resolution);

  // Validate seed
  if (options.seed !== undefined) {
    if (typeof options.seed !== 'number') {
      throw createValidationError('seed must be a number', {
        field: 'seed',
        value: options.seed,
      });
    }

    if (options.seed < 0 || options.seed > 2147483647) {
      throw createValidationError('seed must be between 0 and 2147483647', {
        field: 'seed',
        value: options.seed,
        min: 0,
        max: 2147483647,
      });
    }
  }

  // Validate enable_prompt_expansion
  if (options.enable_prompt_expansion !== undefined) {
    if (typeof options.enable_prompt_expansion !== 'boolean') {
      throw createValidationError('enable_prompt_expansion must be a boolean', {
        field: 'enable_prompt_expansion',
        value: options.enable_prompt_expansion,
      });
    }
  }

  // Validate acceleration
  validateAcceleration(options.acceleration);

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

  // Validate aspect_ratio (optional)
  validateImageAspectRatio(options.aspect_ratio);
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
