/**
 * 核心类型定义
 * 统一管理 SDK 的所有类型声明
 */

/**
 * SDK 配置接口
 */
export interface SDKConfig {
  /**
   * API Key
   */
  apiKey: string;

  /**
   * API 基础 URL
   */
  baseURL?: string;

  /**
   * 请求超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 重试配置
   */
  retry?: RetryConfig;

  /**
   * 日志记录器
   */
  logger?: Logger;
}

/**
 * 重试配置
 */
export interface RetryConfig {
  /**
   * 最大重试次数
   */
  maxRetries?: number;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay?: number;

  /**
   * 是否使用指数退避
   */
  exponentialBackoff?: boolean;
}

/**
 * 日志记录器接口
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * HTTP 请求选项
 */
export interface RequestOptions {
  /**
   * 请求头
   */
  headers?: Record<string, string>;

  /**
   * 查询参数
   */
  params?: Record<string, any>;

  /**
   * 请求超时
   */
  timeout?: number;
}

/**
 * HTTP 客户端接口
 */
export interface HttpClient {
  /**
   * GET 请求
   */
  get<T>(url: string, options?: RequestOptions): Promise<T>;

  /**
   * POST 请求
   */
  post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T>;

  /**
   * 添加中间件
   */
  withMiddleware(middleware: HttpMiddleware): HttpClient;

  /**
   * 获取配置
   */
  readonly config: SDKConfig;
}

/**
 * HTTP 中间件
 */
export type HttpMiddleware = (
  next: <T>(url: string, options: RequestOptions) => Promise<T>
) => <T>(url: string, options: RequestOptions) => Promise<T>;

/**
 * 插件注册表接口
 */
export interface PluginRegistry {
  /**
   * 检查插件是否已注册
   */
  has(name: string): boolean;

  /**
   * 注册插件实例
   */
  set<T>(name: string, instance: T): void;

  /**
   * 获取插件实例
   */
  get<T>(name: string): T | undefined;

  /**
   * 获取所有已注册的插件名称
   */
  keys(): IterableIterator<string>;

  /**
   * 清空所有插件
   */
  clear(): void;
}

/**
 * 插件上下文
 */
export interface PluginContext {
  /**
   * SDK 配置
   */
  config: SDKConfig;

  /**
   * HTTP 客户端
   */
  client: HttpClient;

  /**
   * 插件注册表
   */
  registry: PluginRegistry;
}

/**
 * 依赖规范
 */
export interface DependencySpec {
  /**
   * 依赖的插件名称
   */
  name: string;

  /**
   * 版本要求（semver 表达式）
   */
  version?: string;

  /**
   * 是否可选
   */
  optional?: boolean;
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
  /**
   * 插件名称
   */
  name: string;

  /**
   * 插件版本
   */
  version: string;

  /**
   * 插件描述
   */
  description?: string;

  /**
   * 作者
   */
  author?: string;

  /**
   * 文档链接
   */
  docs?: string;
}

/**
 * 插件接口
 */
export interface Plugin<T = unknown> {
  /**
   * 插件名称（唯一标识）
   */
  name: string;

  /**
   * 插件版本
   */
  version: string;

  /**
   * 插件工厂函数
   */
  factory: (ctx: PluginContext) => T;

  /**
   * 依赖的其他插件
   */
  dependencies?: DependencySpec[];

  /**
   * 初始化钩子
   */
  onInit?: (ctx: PluginContext) => void | Promise<void>;

  /**
   * 销毁钩子
   */
  onDispose?: () => void | Promise<void>;

  /**
   * 插件元数据
   */
  meta?: PluginMetadata;
}

/**
 * 插件 API 基础类型
 */
export type PluginAPI<TEvents = unknown> = {
  /**
   * 销毁方法
   */
  dispose?: () => void | Promise<void>;

  /**
   * 事件
   */
  events?: TEvents;
} & Record<string, unknown>;
