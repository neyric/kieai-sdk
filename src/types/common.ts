export interface SDKConfig {
  baseURL?: string;
  timeout?: number;
  apiKey?: string;
}

export interface APIError {
  error: string;
  message: string;
}

export interface APIResponse<T = any> {
  error?: string;
  message?: string;
  data?: T;
}