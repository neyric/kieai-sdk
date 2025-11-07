/**
 * 配置校验和默认值处理
 */

import type { SDKConfig } from './types';
import { createConfigError } from './errors';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Partial<SDKConfig> = {
  baseURL: 'https://api.kie.ai',
  timeout: 30000,
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
};

/**
 * 校验 SDK 配置
 */
export function validateConfig(config: SDKConfig): void {
  if (!config) {
    throw createConfigError(
      'SDK configuration is required',
      'Provide a valid SDKConfig object'
    );
  }

  if (!config.apiKey) {
    throw createConfigError(
      'API key is required',
      'Provide a valid API key in the configuration',
      { providedConfig: config }
    );
  }

  if (typeof config.apiKey !== 'string' || config.apiKey.trim() === '') {
    throw createConfigError(
      'API key must be a non-empty string',
      'Provide a valid API key',
      { providedApiKey: config.apiKey }
    );
  }

  if (config.baseURL !== undefined) {
    if (typeof config.baseURL !== 'string') {
      throw createConfigError(
        'baseURL must be a string',
        'Provide a valid base URL',
        { providedBaseURL: config.baseURL }
      );
    }

    try {
      new URL(config.baseURL);
    } catch {
      throw createConfigError(
        'baseURL must be a valid URL',
        'Provide a valid base URL like "https://api.example.com"',
        { providedBaseURL: config.baseURL }
      );
    }
  }

  if (config.timeout !== undefined) {
    if (typeof config.timeout !== 'number' || config.timeout <= 0) {
      throw createConfigError(
        'timeout must be a positive number',
        'Provide a timeout in milliseconds (e.g., 30000 for 30 seconds)',
        { providedTimeout: config.timeout }
      );
    }
  }

  if (config.retry !== undefined) {
    if (config.retry.maxRetries !== undefined) {
      if (
        typeof config.retry.maxRetries !== 'number' ||
        config.retry.maxRetries < 0
      ) {
        throw createConfigError(
          'retry.maxRetries must be a non-negative number',
          'Provide a valid retry count',
          { providedMaxRetries: config.retry.maxRetries }
        );
      }
    }

    if (config.retry.retryDelay !== undefined) {
      if (
        typeof config.retry.retryDelay !== 'number' ||
        config.retry.retryDelay < 0
      ) {
        throw createConfigError(
          'retry.retryDelay must be a non-negative number',
          'Provide a valid delay in milliseconds',
          { providedRetryDelay: config.retry.retryDelay }
        );
      }
    }
  }
}

/**
 * 合并默认配置
 */
export function mergeConfig(config: SDKConfig): SDKConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    retry: {
      ...DEFAULT_CONFIG.retry,
      ...config.retry,
    },
  } as SDKConfig;
}

/**
 * 标准化配置
 */
export function normalizeConfig(config: SDKConfig): SDKConfig {
  validateConfig(config);
  const merged = mergeConfig(config);

  // 移除 baseURL 末尾的斜杠
  if (merged.baseURL && merged.baseURL.endsWith('/')) {
    merged.baseURL = merged.baseURL.slice(0, -1);
  }

  return merged;
}
