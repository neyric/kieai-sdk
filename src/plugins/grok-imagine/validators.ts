/**
 * Grok Imagine Plugin Parameter Validators
 */

import { createValidationError } from '../../core/errors';
import type {
  GenerationMode,
  AspectRatio,
  TextToVideoOptions,
  ImageToVideoOptions,
  UpscaleOptions,
} from './api';

/**
 * Validate generation mode
 */
function validateMode(mode: GenerationMode | undefined): void {
  if (mode !== undefined) {
    const validModes: GenerationMode[] = ['fun', 'normal', 'spicy'];
    if (!validModes.includes(mode)) {
      throw createValidationError('mode must be one of: fun, normal, spicy', {
        field: 'mode',
        value: mode,
        validValues: validModes,
      });
    }
  }
}

/**
 * Validate aspect ratio
 */
function validateAspectRatio(aspectRatio: AspectRatio | undefined): void {
  if (aspectRatio !== undefined) {
    const validRatios: AspectRatio[] = ['2:3', '3:2', '1:1'];
    if (!validRatios.includes(aspectRatio)) {
      throw createValidationError('aspect_ratio must be one of: 2:3, 3:2, 1:1', {
        field: 'aspect_ratio',
        value: aspectRatio,
        validValues: validRatios,
      });
    }
  }
}

/**
 * Validate prompt string
 */
function validatePrompt(prompt: string | undefined, required: boolean): void {
  if (required && !prompt) {
    throw createValidationError('prompt is required', { field: 'prompt' });
  }

  if (prompt !== undefined) {
    if (typeof prompt !== 'string' || prompt.trim() === '') {
      throw createValidationError('prompt must be a non-empty string', {
        field: 'prompt',
        value: prompt,
      });
    }

    if (prompt.length > 5000) {
      throw createValidationError('prompt must not exceed 5000 characters', {
        field: 'prompt',
        length: prompt.length,
        maxLength: 5000,
      });
    }
  }
}

/**
 * Validate callback URL
 */
function validateCallBackUrl(callBackUrl: string | undefined): void {
  if (callBackUrl !== undefined) {
    if (typeof callBackUrl !== 'string' || !callBackUrl.startsWith('http')) {
      throw createValidationError('callBackUrl must be a valid HTTP URL', {
        field: 'callBackUrl',
        value: callBackUrl,
      });
    }
  }
}

/**
 * Validate text-to-video generation options
 */
export function validateTextToVideoOptions(options: TextToVideoOptions): void {
  // Validate prompt (required)
  validatePrompt(options.prompt, true);

  // Validate aspect_ratio
  validateAspectRatio(options.aspect_ratio);

  // Validate mode
  validateMode(options.mode);

  // Validate callBackUrl
  validateCallBackUrl(options.callBackUrl);
}

/**
 * Validate image-to-video generation options
 */
export function validateImageToVideoOptions(options: ImageToVideoOptions): void {
  // Must provide either image_urls OR (task_id + index), but not both
  const hasImageUrls = options.image_urls && options.image_urls.length > 0;
  const hasTaskId = !!options.task_id;

  if (!hasImageUrls && !hasTaskId) {
    throw createValidationError(
      'Either image_urls or task_id must be provided',
      { field: 'image_urls/task_id' }
    );
  }

  if (hasImageUrls && hasTaskId) {
    throw createValidationError(
      'Cannot provide both image_urls and task_id at the same time',
      { field: 'image_urls/task_id' }
    );
  }

  // Validate image_urls
  if (hasImageUrls) {
    if (!Array.isArray(options.image_urls)) {
      throw createValidationError('image_urls must be an array', {
        field: 'image_urls',
        value: options.image_urls,
      });
    }

    options.image_urls!.forEach((url, index) => {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        throw createValidationError(`image_urls[${index}] must be a valid HTTP URL`, {
          field: `image_urls[${index}]`,
          value: url,
        });
      }
    });
  }

  // Validate task_id
  if (hasTaskId) {
    if (typeof options.task_id !== 'string' || options.task_id.trim() === '') {
      throw createValidationError('task_id must be a non-empty string', {
        field: 'task_id',
        value: options.task_id,
      });
    }

    if (options.task_id.length > 100) {
      throw createValidationError('task_id must not exceed 100 characters', {
        field: 'task_id',
        length: options.task_id.length,
        maxLength: 100,
      });
    }
  }

  // Validate index (only valid with task_id)
  if (options.index !== undefined) {
    if (!hasTaskId) {
      throw createValidationError('index can only be used with task_id', {
        field: 'index',
      });
    }

    if (typeof options.index !== 'number' || options.index < 0 || options.index > 5) {
      throw createValidationError('index must be a number between 0 and 5', {
        field: 'index',
        value: options.index,
        validRange: '0-5',
      });
    }
  }

  // Validate prompt (optional)
  validatePrompt(options.prompt, false);

  // Validate mode
  validateMode(options.mode);

  // Validate callBackUrl
  validateCallBackUrl(options.callBackUrl);
}

/**
 * Validate upscale options
 */
export function validateUpscaleOptions(options: UpscaleOptions): void {
  // Validate task_id (required)
  if (!options.task_id) {
    throw createValidationError('task_id is required', { field: 'task_id' });
  }

  if (typeof options.task_id !== 'string' || options.task_id.trim() === '') {
    throw createValidationError('task_id must be a non-empty string', {
      field: 'task_id',
      value: options.task_id,
    });
  }

  if (options.task_id.length > 100) {
    throw createValidationError('task_id must not exceed 100 characters', {
      field: 'task_id',
      length: options.task_id.length,
      maxLength: 100,
    });
  }

  // Validate callBackUrl
  validateCallBackUrl(options.callBackUrl);
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
