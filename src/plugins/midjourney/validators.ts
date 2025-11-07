/**
 * Midjourney 插件参数校验
 */

import { createValidationError } from '../../core/errors';
import type {
  TextToImageOptions,
  ImageToImageOptions,
  UpscaleOptions,
  VaryOptions,
} from './api';

/**
 * 校验文本生成图片选项
 */
export function validateTextToImageOptions(
  options: TextToImageOptions
): void {
  if (!options.prompt) {
    throw createValidationError('prompt is required', { field: 'prompt' });
  }

  if (typeof options.prompt !== 'string' || options.prompt.trim() === '') {
    throw createValidationError('prompt must be a non-empty string', {
      field: 'prompt',
      value: options.prompt,
    });
  }

  if (options.variety !== undefined) {
    if (typeof options.variety !== 'number' || options.variety < 0) {
      throw createValidationError('variety must be a non-negative number', {
        field: 'variety',
        value: options.variety,
      });
    }
    if (options.variety % 5 !== 0) {
      throw createValidationError('variety must be incremented by 5', {
        field: 'variety',
        value: options.variety,
        hint: 'Use values like 0, 5, 10, 15, etc.',
      });
    }
  }

  if (options.stylization !== undefined) {
    if (
      typeof options.stylization !== 'number' ||
      options.stylization < 0 ||
      options.stylization > 1000
    ) {
      throw createValidationError(
        'stylization must be a number between 0 and 1000',
        {
          field: 'stylization',
          value: options.stylization,
        }
      );
    }
  }

  if (options.weirdness !== undefined) {
    if (
      typeof options.weirdness !== 'number' ||
      options.weirdness < 0 ||
      options.weirdness > 3000
    ) {
      throw createValidationError(
        'weirdness must be a number between 0 and 3000',
        {
          field: 'weirdness',
          value: options.weirdness,
        }
      );
    }
  }
}

/**
 * 校验图片生成图片选项
 */
export function validateImageToImageOptions(
  options: ImageToImageOptions
): void {
  validateTextToImageOptions(options);

  if (!options.fileUrls || !Array.isArray(options.fileUrls)) {
    throw createValidationError('fileUrls must be an array', {
      field: 'fileUrls',
      value: options.fileUrls,
    });
  }

  if (options.fileUrls.length === 0) {
    throw createValidationError('fileUrls must contain at least one URL', {
      field: 'fileUrls',
    });
  }

  for (const url of options.fileUrls) {
    if (typeof url !== 'string' || !url.startsWith('http')) {
      throw createValidationError('fileUrls must contain valid HTTP URLs', {
        field: 'fileUrls',
        invalidUrl: url,
      });
    }
  }
}

/**
 * 校验图片放大选项
 */
export function validateUpscaleOptions(options: UpscaleOptions): void {
  if (!options.taskId) {
    throw createValidationError('taskId is required', { field: 'taskId' });
  }

  if (typeof options.taskId !== 'string' || options.taskId.trim() === '') {
    throw createValidationError('taskId must be a non-empty string', {
      field: 'taskId',
      value: options.taskId,
    });
  }

  if (options.imageIndex === undefined || options.imageIndex === null) {
    throw createValidationError('imageIndex is required', {
      field: 'imageIndex',
    });
  }

  if (
    typeof options.imageIndex !== 'number' ||
    options.imageIndex < 1 ||
    options.imageIndex > 4
  ) {
    throw createValidationError('imageIndex must be a number between 1 and 4', {
      field: 'imageIndex',
      value: options.imageIndex,
    });
  }
}

/**
 * 校验图片变体选项
 */
export function validateVaryOptions(options: VaryOptions): void {
  validateUpscaleOptions(options);
}

/**
 * 校验任务 ID
 */
export function validateTaskId(taskId: string): void {
  if (!taskId) {
    throw createValidationError('taskId is required');
  }

  if (typeof taskId !== 'string' || taskId.trim() === '') {
    throw createValidationError('taskId must be a non-empty string', {
      value: taskId,
    });
  }
}
