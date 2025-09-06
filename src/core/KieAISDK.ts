import { HttpClient } from './HttpClient';
import type { SDKConfig } from '../types/common';

export class KieAISDK {
  private readonly apiKey: string;
  private readonly httpClient: HttpClient;
  
  constructor(apiKey: string, config?: SDKConfig) {
    if (!apiKey) {
      throw new Error('API Key 是必需的');
    }
    
    this.apiKey = apiKey;
    this.httpClient = new HttpClient({
      ...config,
      apiKey
    });
  }
  
  /**
   * 获取 HTTP 客户端实例
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }
  
  /**
   * 创建新的 SDK 实例
   */
  static create(apiKey: string, config?: SDKConfig): KieAISDK {
    return new KieAISDK(apiKey, config);
  }
}