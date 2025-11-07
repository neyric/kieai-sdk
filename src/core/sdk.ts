/**
 * KieAI SDK 主类实现
 */

import type { SDKConfig, Plugin, PluginContext, HttpClient } from './types';
import { PluginRegistry } from './registry';
import { normalizeConfig } from './config';
import { createHttpClient } from './http/client';
import {
  createPluginNotRegisteredError,
  createPluginDuplicateError,
  createDependencyMissingError,
} from './errors';

/**
 * KieAI SDK 主类
 */
export class KieAISDK {
  private readonly client: HttpClient;
  private readonly registry: PluginRegistry;
  private readonly _config: SDKConfig;
  private readonly pluginMetadata = new Map<string, Plugin>();

  constructor(config: SDKConfig) {
    // 校验并标准化配置
    this._config = normalizeConfig(config);

    // 创建 HTTP 客户端
    this.client = createHttpClient(this._config);

    // 创建插件注册表
    this.registry = new PluginRegistry();
  }

  /**
   * 获取 SDK 配置
   */
  get config(): Readonly<SDKConfig> {
    return this._config;
  }

  /**
   * 注册单个插件
   */
  use<T>(plugin: Plugin<T>): this {
    // 检查插件是否已注册
    if (this.registry.has(plugin.name)) {
      throw createPluginDuplicateError(plugin.name);
    }

    // 验证依赖
    this.validateDependencies(plugin);

    // 创建插件上下文
    const ctx: PluginContext = {
      config: this._config,
      client: this.client,
      registry: this.registry,
    };

    try {
      // 执行初始化钩子
      if (plugin.onInit) {
        const result = plugin.onInit(ctx);
        if (result instanceof Promise) {
          throw new Error(
            `Plugin "${plugin.name}" onInit hook returned a Promise. ` +
            'Async initialization is not yet supported. ' +
            'Please use synchronous initialization or handle async logic in the factory function.'
          );
        }
      }

      // 创建插件实例
      const instance = plugin.factory(ctx);

      // 注册插件实例
      this.registry.set(plugin.name, instance);

      // 保存插件元数据
      this.pluginMetadata.set(plugin.name, plugin);

      return this;
    } catch (error) {
      // 如果初始化失败，清理插件
      this.registry.set(plugin.name, undefined);
      throw error;
    }
  }

  /**
   * 批量注册插件
   */
  useMany(plugins: Plugin[]): this {
    plugins.forEach((plugin) => this.use(plugin));
    return this;
  }

  /**
   * 获取插件实例
   */
  get<T>(name: string): T {
    const instance = this.registry.get<T>(name);

    if (!instance) {
      throw createPluginNotRegisteredError(name);
    }

    return instance;
  }

  /**
   * 检查插件是否已注册
   */
  has(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * 销毁 SDK 实例
   */
  async dispose(): Promise<void> {
    const disposePromises: Promise<void>[] = [];

    // 调用所有插件的销毁钩子
    for (const name of this.registry.keys()) {
      const plugin = this.pluginMetadata.get(name);
      if (plugin?.onDispose) {
        const result = plugin.onDispose();
        if (result instanceof Promise) {
          disposePromises.push(result);
        }
      }
    }

    // 等待所有销毁钩子完成
    await Promise.all(disposePromises);

    // 清空注册表
    this.registry.clear();
    this.pluginMetadata.clear();
  }

  /**
   * 验证插件依赖
   */
  private validateDependencies(plugin: Plugin): void {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return;
    }

    for (const dep of plugin.dependencies) {
      // 跳过可选依赖
      if (dep.optional && !this.registry.has(dep.name)) {
        continue;
      }

      // 检查必需依赖是否存在
      if (!this.registry.has(dep.name)) {
        throw createDependencyMissingError(plugin.name, dep.name);
      }

      // TODO: 版本检查（需要实现 semver 比较）
      // if (dep.version) {
      //   const installedPlugin = this.pluginMetadata.get(dep.name);
      //   if (installedPlugin && !satisfies(installedPlugin.version, dep.version)) {
      //     throw createDependencyVersionMismatchError(...)
      //   }
      // }
    }
  }

  /**
   * 获取所有已注册的插件名称
   */
  getRegisteredPlugins(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * 获取插件元数据
   */
  getPluginMetadata(name: string): Plugin | undefined {
    return this.pluginMetadata.get(name);
  }

  /**
   * 静态工厂方法
   */
  static create(config: SDKConfig): KieAISDK {
    return new KieAISDK(config);
  }
}
