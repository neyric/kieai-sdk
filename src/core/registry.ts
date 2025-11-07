/**
 * 插件注册器实现
 */

import type { PluginRegistry as IPluginRegistry } from './types';

/**
 * 插件注册器实现类
 */
export class PluginRegistry implements IPluginRegistry {
  private modules = new Map<string, unknown>();

  /**
   * 检查插件是否已注册
   */
  has(name: string): boolean {
    return this.modules.has(name);
  }

  /**
   * 注册插件实例
   */
  set<T>(name: string, instance: T): void {
    this.modules.set(name, instance);
  }

  /**
   * 获取插件实例
   */
  get<T>(name: string): T | undefined {
    return this.modules.get(name) as T | undefined;
  }

  /**
   * 获取所有已注册的插件名称
   */
  keys(): IterableIterator<string> {
    return this.modules.keys();
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.modules.clear();
  }

  /**
   * 获取插件数量
   */
  get size(): number {
    return this.modules.size;
  }
}
