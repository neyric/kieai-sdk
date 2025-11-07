/**
 * Hailuo 2.3 Plugin Parameter Validators
 */

import { createValidationError } from '../../core/errors';
import type {
  ImageToVideoOptions,
  ModelMode,
  VideoResolution,
  VideoDuration,
} from './api';

/**
 * Validate model mode
 */
function validateMode(mode: ModelMode | undefined): void {
  if (mode !== undefined) {
    const validModes: ModelMode[] = ['pro', 'standard'];
    if (!validModes.includes(mode)) {
      throw createValidationError('mode must be either "pro" or "standard"', {
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
    const validResolutions: VideoResolution[] = ['768P', '1080P'];
    if (!validResolutions.includes(resolution)) {
      throw createValidationError('resolution must be either "768P" or "1080P"', {
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
    const validDurations: VideoDuration[] = ['6', '10'];
    if (!validDurations.includes(duration)) {
      throw createValidationError('duration must be either "6" or "10"', {
        field: 'duration',
        value: duration,
        validValues: validDurations,
      });
    }
  }
}

/**
 * Validate resolution and duration combination
 * 10 seconds videos are not supported for 1080P resolution
 */
function validateResolutionAndDuration(
  resolution: VideoResolution | undefined,
  duration: VideoDuration | undefined
): void {
  const finalResolution = resolution || '768P';
  const finalDuration = duration || '6';

  if (finalResolution === '1080P' && finalDuration === '10') {
    throw createValidationError(
      '10 seconds videos are not supported for 1080P resolution',
      {
        field: 'resolution,duration',
        resolution: finalResolution,
        duration: finalDuration,
      }
    );
  }
}

/**
 * Validate image-to-video generation options
 */
export function validateImageToVideoOptions(options: ImageToVideoOptions): void {
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

  if (options.prompt.length > 5000) {
    throw createValidationError('prompt must not exceed 5000 characters', {
      field: 'prompt',
      length: options.prompt.length,
      maxLength: 5000,
    });
  }

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

  // Validate resolution
  validateResolution(options.resolution);

  // Validate duration
  validateDuration(options.duration);

  // Validate resolution and duration combination
  validateResolutionAndDuration(options.resolution, options.duration);

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
