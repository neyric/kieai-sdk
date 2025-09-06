export interface SDKConfig {
  baseURL?: string;
  timeout?: number;
  apiKey: string;
}

export interface APIResponse<T = unknown> {
  code: 200 | 401 | 402 | 404 | 422 | 429 | 455 | 500 | 501 | 505;
  msg: string;
  data: T;
}
