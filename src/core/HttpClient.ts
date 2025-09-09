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

  async request<T = unknown>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = "GET", params, data, headers = {} } = options;

    let requestURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      requestURL += `?${queryString}`;
    }
    const requestHeaders = new Headers(headers);
    requestHeaders.set("Content-Type", "application/json");

    if (this.apiKey) {
      requestHeaders.set("Authorization", `Bearer ${this.apiKey}`);
    }

    const headersJSON: Record<string, string> = {};
    requestHeaders.forEach((value, key) => {
      headersJSON[key] = value;
    });

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

      if (!response.ok) {
        throw new KieError(
          response.statusText,
          KieErrorCode.INTERNAL_SERVER_ERROR,
          KieErrorType.UNKNOWN_ERROR,
          {
            requestInfo: {
              method,
              url: requestURL,
              params,
              headers: headersJSON,
            },
          }
        );
      }
      const responseData = (await response.json()) as APIResponse<T>;

      // 处理旧版本的错误格式
      if (responseData.code !== 200) {
        throw createApiError(responseData, {
          method,
          url: requestURL,
          params,
          headers: headersJSON,
        });
      }

      return responseData.data;
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
                headers: headersJSON,
              },
            }
          );
        }

        // 网络错误
        throw createNetworkError(`Failed to Fetch: ${error.message}`, error, {
          method,
          url: requestURL,
          params,
          headers: headersJSON,
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
            headers: headersJSON,
          },
        }
      );
    }
  }

  async get<T = unknown>(url: string, params?: Record<string, any>) {
    return this.request<T>(url, { method: "GET", params });
  }

  async post<T = unknown>(
    url: string,
    data?: any,
    params?: Record<string, any>
  ) {
    return this.request<T>(url, { method: "POST", data, params });
  }
}
