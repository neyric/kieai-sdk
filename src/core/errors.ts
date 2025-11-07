/**
 * SDK 错误类型定义
 */

/**
 * SDK 错误类型枚举
 */
export enum SDKErrorKind {
  /**
   * 配置无效
   */
  ConfigInvalid = 'ConfigInvalid',

  /**
   * HTTP 请求失败
   */
  HttpFailure = 'HttpFailure',

  /**
   * 插件未注册
   */
  PluginNotRegistered = 'PluginNotRegistered',

  /**
   * 插件重复注册
   */
  PluginDuplicate = 'PluginDuplicate',

  /**
   * 依赖缺失
   */
  DependencyMissing = 'DependencyMissing',

  /**
   * 依赖版本不匹配
   */
  DependencyVersionMismatch = 'DependencyVersionMismatch',

  /**
   * 参数验证错误
   */
  ValidationError = 'ValidationError',

  /**
   * 超时错误
   */
  TimeoutError = 'TimeoutError',

  /**
   * 网络错误
   */
  NetworkError = 'NetworkError',

  /**
   * 未知错误
   */
  UnknownError = 'UnknownError',
}

/**
 * SDK 错误载荷
 */
export interface SDKErrorPayload {
  /**
   * 错误类型
   */
  kind: SDKErrorKind;

  /**
   * 错误消息
   */
  message: string;

  /**
   * 原始错误
   */
  cause?: unknown;

  /**
   * 错误提示
   */
  hint?: string;

  /**
   * 错误上下文
   */
  context?: Record<string, unknown>;
}

/**
 * SDK 错误类
 */
export class SDKError extends Error {
  public readonly kind: SDKErrorKind;
  public readonly cause?: unknown;
  public readonly hint?: string;
  public readonly context?: Record<string, unknown>;

  constructor(payload: SDKErrorPayload) {
    super(payload.message);
    this.name = payload.kind;
    this.kind = payload.kind;
    this.cause = payload.cause;
    this.hint = payload.hint;
    this.context = payload.context;

    // 保持正确的错误堆栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SDKError);
    }
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON() {
    return {
      name: this.name,
      kind: this.kind,
      message: this.message,
      hint: this.hint,
      context: this.context,
      cause: this.cause instanceof Error
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : this.cause,
      stack: this.stack,
    };
  }

  /**
   * 判断是否为配置错误
   */
  isConfigError(): boolean {
    return this.kind === SDKErrorKind.ConfigInvalid;
  }

  /**
   * 判断是否为插件相关错误
   */
  isPluginError(): boolean {
    return (
      this.kind === SDKErrorKind.PluginNotRegistered ||
      this.kind === SDKErrorKind.PluginDuplicate ||
      this.kind === SDKErrorKind.DependencyMissing ||
      this.kind === SDKErrorKind.DependencyVersionMismatch
    );
  }

  /**
   * 判断是否为网络相关错误
   */
  isNetworkError(): boolean {
    return (
      this.kind === SDKErrorKind.HttpFailure ||
      this.kind === SDKErrorKind.TimeoutError ||
      this.kind === SDKErrorKind.NetworkError
    );
  }
}

/**
 * 创建配置错误
 */
export function createConfigError(
  message: string,
  hint?: string,
  context?: Record<string, unknown>
): SDKError {
  return new SDKError({
    kind: SDKErrorKind.ConfigInvalid,
    message,
    hint,
    context,
  });
}

/**
 * 创建插件未注册错误
 */
export function createPluginNotRegisteredError(
  pluginName: string,
  hint?: string
): SDKError {
  return new SDKError({
    kind: SDKErrorKind.PluginNotRegistered,
    message: `Plugin "${pluginName}" is not registered`,
    hint: hint || `Call sdk.use(...) to register the plugin first`,
    context: { pluginName },
  });
}

/**
 * 创建插件重复错误
 */
export function createPluginDuplicateError(pluginName: string): SDKError {
  return new SDKError({
    kind: SDKErrorKind.PluginDuplicate,
    message: `Plugin "${pluginName}" is already registered`,
    context: { pluginName },
  });
}

/**
 * 创建依赖缺失错误
 */
export function createDependencyMissingError(
  pluginName: string,
  dependency: string,
  hint?: string
): SDKError {
  return new SDKError({
    kind: SDKErrorKind.DependencyMissing,
    message: `Plugin "${pluginName}" requires "${dependency}" to be registered first`,
    hint: hint || `Register the dependency plugin before registering "${pluginName}"`,
    context: { pluginName, dependency },
  });
}

/**
 * 创建 HTTP 错误
 */
export function createHttpError(
  message: string,
  cause?: unknown,
  context?: Record<string, unknown>
): SDKError {
  return new SDKError({
    kind: SDKErrorKind.HttpFailure,
    message,
    cause,
    context,
  });
}

/**
 * 创建验证错误
 */
export function createValidationError(
  message: string,
  context?: Record<string, unknown>
): SDKError {
  return new SDKError({
    kind: SDKErrorKind.ValidationError,
    message,
    context,
  });
}

/**
 * 创建超时错误
 */
export function createTimeoutError(
  timeout: number,
  context?: Record<string, unknown>
): SDKError {
  return new SDKError({
    kind: SDKErrorKind.TimeoutError,
    message: `Request timeout after ${timeout}ms`,
    context,
  });
}

/**
 * 创建网络错误
 */
export function createNetworkError(
  message: string,
  cause?: unknown,
  context?: Record<string, unknown>
): SDKError {
  return new SDKError({
    kind: SDKErrorKind.NetworkError,
    message,
    cause,
    context,
  });
}
