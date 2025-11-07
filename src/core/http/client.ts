/**
 * HTTP 客户端实现
 */

import type { SDKConfig, RequestOptions, HttpClient as IHttpClient, HttpMiddleware } from '../types';
import {
  createHttpError,
  createTimeoutError,
  createNetworkError,
} from '../errors';

/**
 * API 响应接口
 */
interface APIResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

/**
 * HTTP 客户端实现类
 */
export class HttpClient implements IHttpClient {
  private middlewares: HttpMiddleware[] = [];

  constructor(public readonly config: SDKConfig) {}

  /**
   * 添加中间件
   */
  withMiddleware(middleware: HttpMiddleware): HttpClient {
    const client = new HttpClient(this.config);
    client.middlewares = [...this.middlewares, middleware];
    return client;
  }

  /**
   * GET 请求
   */
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  /**
   * POST 请求
   */
  async post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', url, body, options);
  }

  /**
   * 执行 HTTP 请求
   */
  private async request<T>(
    method: 'GET' | 'POST',
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    // 构建完整 URL
    const fullURL = url.startsWith('http')
      ? url
      : `${this.config.baseURL}${url}`;

    // 添加查询参数
    let requestURL = fullURL;
    if (options?.params && Object.keys(options.params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        requestURL += (requestURL.includes('?') ? '&' : '?') + queryString;
      }
    }

    // 构建请求头
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    if (this.config.apiKey) {
      headers.set('Authorization', `Bearer ${this.config.apiKey}`);
    }

    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    // 超时控制
    const timeout = options?.timeout || this.config.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // 执行请求
      const response = await fetch(requestURL, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理响应
      const responseData = await response.json() as APIResponse<T>;

      // 检查 HTTP 状态码
      if (!response.ok) {
        throw createHttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          undefined,
          {
            method,
            url: requestURL,
            status: response.status,
            statusText: response.statusText,
            response: responseData,
          }
        );
      }

      // 检查业务状态码
      if (responseData.code !== 200) {
        throw createHttpError(
          `API Error: ${responseData.msg || 'Unknown error'}`,
          undefined,
          {
            method,
            url: requestURL,
            code: responseData.code,
            message: responseData.msg,
            response: responseData,
          }
        );
      }

      return responseData.data;
    } catch (error) {
      clearTimeout(timeoutId);

      // 如果已经是 SDKError，直接抛出
      if (error && typeof error === 'object' && 'kind' in error) {
        throw error;
      }

      // 超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw createTimeoutError(timeout, {
          method,
          url: requestURL,
        });
      }

      // 网络错误
      if (error instanceof Error) {
        throw createNetworkError(
          `Network error: ${error.message}`,
          error,
          {
            method,
            url: requestURL,
          }
        );
      }

      // 未知错误
      throw createHttpError(
        'Unknown error occurred',
        error,
        {
          method,
          url: requestURL,
        }
      );
    }
  }
}

/**
 * 创建 HTTP 客户端
 */
export function createHttpClient(config: SDKConfig): HttpClient {
  return new HttpClient(config);
}
