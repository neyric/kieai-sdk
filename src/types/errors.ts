/**
 * 错误代码常量
 */
export enum KieErrorCode {
  // HTTP 状态码相关
  BAD_REQUEST = 400, // 参数验证错误
  TIMEOUT = 408, // 请求超时
  INTERNAL_SERVER_ERROR = 500, // 网络错误/未知错误

  // 配置错误
  CONFIG_ERROR = 1000,
}

/**
 * KieAI SDK错误类型枚举
 */
export enum KieErrorType {
  // 网络相关错误
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",

  // API业务错误
  API_ERROR = "API_ERROR",

  // 参数验证错误
  VALIDATION_ERROR = "VALIDATION_ERROR",

  // 配置错误
  CONFIG_ERROR = "CONFIG_ERROR",

  // 未知错误
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * KieAI SDK错误类
 */
export class KieError extends Error {
  /**
   * 错误代码
   */
  public readonly code: number;

  /**
   * 错误类型
   */
  public readonly type: KieErrorType;

  /**
   * 原始错误对象（如果有）
   */
  public readonly originalError?: Error;

  /**
   * 请求相关信息（用于调试）
   */
  public readonly requestInfo?: {
    method?: string;
    url?: string;
    params?: any;
    headers?: Record<string, string>;
  };

  /**
   * API返回的原始响应（如果有）
   */
  public readonly apiResponse?: APIResponse;

  constructor(
    message: string,
    code: number,
    type: KieErrorType = KieErrorType.UNKNOWN_ERROR,
    options?: {
      originalError?: Error;
      requestInfo?: KieError["requestInfo"];
      apiResponse?: KieError["apiResponse"];
    }
  ) {
    super(message);

    this.name = "KieError";
    this.code = code;
    this.type = type;
    this.originalError = options?.originalError;
    this.requestInfo = options?.requestInfo;
    this.apiResponse = options?.apiResponse;

    // 保持正确的错误堆栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KieError);
    }
  }

  /**
   * 判断是否为网络相关错误
   */
  isNetworkError(): boolean {
    return (
      this.type === KieErrorType.NETWORK_ERROR ||
      this.type === KieErrorType.TIMEOUT_ERROR
    );
  }

  /**
   * 判断是否为API业务错误
   */
  isApiError(): boolean {
    return this.type === KieErrorType.API_ERROR;
  }

  /**
   * 判断是否为参数验证错误
   */
  isValidationError(): boolean {
    return this.type === KieErrorType.VALIDATION_ERROR;
  }

  /**
   * 获取详细的错误信息对象
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      type: this.type,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
      requestInfo: this.requestInfo,
      apiResponse: this.apiResponse,
    };
  }
}

/**
 * 创建API错误的便捷方法
 */
export function createApiError(
  response: APIResponse,
  requestInfo?: KieError["requestInfo"]
): KieError {
  return new KieError(
    `API Error: ${response.msg}`,
    KieErrorCode.BAD_REQUEST,
    KieErrorType.API_ERROR,
    {
      apiResponse: response,
      requestInfo,
    }
  );
}

/**
 * 创建网络错误的便捷方法
 */
export function createNetworkError(
  message: string,
  originalError?: Error,
  requestInfo?: KieError["requestInfo"]
): KieError {
  return new KieError(
    message,
    KieErrorCode.INTERNAL_SERVER_ERROR,
    KieErrorType.NETWORK_ERROR,
    {
      originalError,
      requestInfo,
    }
  );
}

/**
 * 创建参数验证错误的便捷方法
 */
export function createValidationError(
  message: string,
  invalidParam?: string
): KieError {
  return new KieError(
    message,
    KieErrorCode.BAD_REQUEST,
    KieErrorType.VALIDATION_ERROR,
    {
      requestInfo: invalidParam ? { params: { invalidParam } } : undefined,
    }
  );
}
