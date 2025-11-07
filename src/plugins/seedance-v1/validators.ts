/**
 * SeeDance V1 Plugin Parameter Validators
 */

import { createValidationError } from '../../core/errors';
import type {
  BaseVideoOptions,
  ImageToVideoOptions,
  TextToVideoOptions,
  ModelMode,
  VideoResolution,
  VideoDuration,
  AspectRatio,
} from './api';

/**
 * Validate model mode
 */
function validateMode(mode: ModelMode | undefined): void {
  if (mode !== undefined) {
    const validModes: ModelMode[] = ['pro', 'lite'];
    if (!validModes.includes(mode)) {
      throw createValidationError('mode must be either "pro" or "lite"', {
        field: 'mode',
        value: mode,
        validValues: validModes,
      });
    }
  }
}

/**
 * Validate video resolution
 */
function validateResolution(resolution: VideoResolution | undefined): void {
  if (resolution !== undefined) {
    const validResolutions: VideoResolution[] = ['480p', '720p', '1080p'];
    if (!validResolutions.includes(resolution)) {
      throw createValidationError('resolution must be one of: 480p, 720p, 1080p', {
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
    const validDurations: VideoDuration[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (!validDurations.includes(duration)) {
      throw createValidationError('duration must be between 3 and 12 seconds', {
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
    const validRatios: AspectRatio[] = ['16:9', '4:3', '1:1', '3:4', '9:16', '9:21'];
    if (!validRatios.includes(aspectRatio)) {
      throw createValidationError(
        'aspect_ratio must be one of: 16:9, 4:3, 1:1, 3:4, 9:16, 9:21',
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
 * Validate base video generation options
 */
export function validateBaseVideoOptions(options: BaseVideoOptions): void {
  // Validate mode
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

  // Validate resolution
  validateResolution(options.resolution);

  // Validate duration
  validateDuration(options.duration);

  // Validate seed
  if (options.seed !== undefined) {
    if (typeof options.seed !== 'number') {
      throw createValidationError('seed must be a number', {
        field: 'seed',
        value: options.seed,
      });
    }
  }

  // Validate camera_fixed
  if (options.camera_fixed !== undefined) {
    if (typeof options.camera_fixed !== 'boolean') {
      throw createValidationError('camera_fixed must be a boolean', {
        field: 'camera_fixed',
        value: options.camera_fixed,
      });
    }
  }

  // Validate enable_safety_checker
  if (options.enable_safety_checker !== undefined) {
    if (typeof options.enable_safety_checker !== 'boolean') {
      throw createValidationError('enable_safety_checker must be a boolean', {
        field: 'enable_safety_checker',
        value: options.enable_safety_checker,
      });
    }
  }

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

  // Validate end_image_url (optional)
  if (options.end_image_url !== undefined) {
    if (
      typeof options.end_image_url !== 'string' ||
      !options.end_image_url.startsWith('http')
    ) {
      throw createValidationError('end_image_url must be a valid HTTP URL', {
        field: 'end_image_url',
        value: options.end_image_url,
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
