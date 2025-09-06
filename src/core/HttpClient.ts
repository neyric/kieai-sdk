import {
  KieError,
  KieErrorType,
  KieErrorCode,
  createApiError,
  createNetworkError,
} from "../types/errors";

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  apiKey?: string;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

export class HttpClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly apiKey?: string;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || "https://api.kie.ai";
    this.timeout = config.timeout || 30000;
    this.apiKey = config.apiKey;
  }

  async request<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = "GET", params, data, headers = {} } = options;

    let requestURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      requestURL += `?${queryString}`;
    }

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (this.apiKey) {
      requestHeaders["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(requestURL, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (responseData.error) {
        throw createApiError(
          responseData.error,
          responseData.message || "未知API错误",
          {
            method,
            url: requestURL,
            params,
            headers: requestHeaders,
          }
        );
      }

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);

      // 如果已经是KieError，直接抛出
      if (error instanceof KieError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new KieError(
            `Fetch timeout (${this.timeout}ms)`,
            KieErrorCode.TIMEOUT,
            KieErrorType.TIMEOUT_ERROR,
            {
              originalError: error,
              requestInfo: {
                method,
                url: requestURL,
                params,
                headers: requestHeaders,
              },
            }
          );
        }

        // 网络错误
        throw createNetworkError(`Failed to Fetch: ${error.message}`, error, {
          method,
          url: requestURL,
          params,
          headers: requestHeaders,
        });
      }

      // 未知错误
      throw new KieError(
        "Unknow Failed: Unknown Error",
        KieErrorCode.INTERNAL_SERVER_ERROR,
        KieErrorType.UNKNOWN_ERROR,
        {
          requestInfo: {
            method,
            url: requestURL,
            params,
            headers: requestHeaders,
          },
        }
      );
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(url, { method: "GET", params });
  }

  async post<T = any>(
    url: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(url, { method: "POST", data, params });
  }
}
