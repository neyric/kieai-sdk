# KieAI SDK 架构重构方案

## 目录
- [现状分析](#现状分析)
- [架构设计方案](#架构设计方案)
- [推荐方案：混合架构](#推荐方案混合架构)
- [实现细节](#实现细节)
- [迁移计划](#迁移计划)
- [API 使用示例](#api-使用示例)

## 现状分析

### 当前架构问题

1. **核心类臃肿**
   - `KieAISDK` 类需要手动注册所有模块
   - 每次新增模块都需要修改核心代码
   - 所有模块强制加载，无法按需使用

2. **模块创建不一致**
   ```typescript
   // 有的使用 Class
   this.gptImage = new GPT4oImageModule(this.httpClient);
   
   // 有的使用 Factory Function
   this.seeDance = createSeeDanceModules(this.httpClient);
   ```

3. **重复的回调验证逻辑**
   - 每个 jobs-module 都有相似的 switch-case
   - 违反 DRY 原则

4. **缺乏扩展机制**
   - 无法在不修改源码的情况下添加新模块
   - 第三方开发者无法贡献模块

### 当前架构优点

- ✅ 类型安全完整
- ✅ 错误处理机制完善
- ✅ 基础抽象合理（BaseModule, HttpClient）
- ✅ 代码结构清晰

## 架构设计方案

### 方案对比

| 特性 | 当前架构 | 方案1:插件化 | 方案2:装饰器 | 方案3:函数式 | 方案4:统一任务 |
|-----|---------|------------|------------|------------|--------------|
| **扩展性** | ❌ 需改核心 | ✅ 独立插件 | ✅ 自动注册 | ✅ 灵活组合 | ✅ 动态注册 |
| **类型安全** | ✅ 完整 | ⚠️ 需要泛型 | ✅ 完整 | ✅ 最佳 | ✅ 完整 |
| **按需加载** | ❌ 全量加载 | ✅ 支持 | ⚠️ 需额外配置 | ✅ 天然支持 | ✅ 支持 |
| **学习成本** | ✅ 简单 | ✅ 简单 | ⚠️ 装饰器概念 | ✅ 函数式 | ✅ 简单 |
| **代码量** | ❌ 冗余多 | ✅ 精简 | ✅ 精简 | ✅ 最精简 | ✅ 精简 |
| **维护性** | ⚠️ 一般 | ✅ 优秀 | ✅ 优秀 | ✅ 优秀 | ✅ 优秀 |

### 方案1：插件化架构

```typescript
export abstract class Plugin<T = any> {
  abstract readonly config: PluginConfig;
  abstract initialize(httpClient: HttpClient): T;
}

// 使用
const sdk = new KieAISDK({ apiKey: 'xxx' });
const midjourney = sdk.use(new MidjourneyPlugin());
```

**优点：** 清晰的插件边界，易于理解
**缺点：** 需要额外的插件类定义

### 方案2：装饰器模式

```typescript
@Module({
  name: 'midjourney',
  path: '/api/v1/midjourney'
})
export class MidjourneyModule extends BaseModule {
  @Post('/generate')
  async generate(options: GenerateOptions) {
    return this.request(options);
  }
}
```

**优点：** 声明式，代码简洁
**缺点：** 装饰器在 TypeScript 中仍是实验性功能

### 方案3：函数式组合

```typescript
export const createMidjourneyModule = (client: HttpClient) => ({
  async generate(options: GenerateOptions) {
    return client.post('/api/v1/midjourney/generate', options);
  }
});
```

**优点：** 简单直接，易于测试，tree-shaking 友好
**缺点：** 缺少面向对象的结构

### 方案4：统一任务系统

```typescript
const tasks = new TaskSystem(httpClient);
tasks.register('midjourney/v6', MidjourneySchema);
const result = await tasks.execute('midjourney/v6', { prompt: 'a cat' });
```

**优点：** 统一的任务处理接口
**缺点：** 不够直观，需要记住模型名称

## 推荐方案：混合架构

结合插件化和函数式的优点，提供最大的灵活性和类型安全。

### 核心设计原则

1. **插件化** - 模块以插件形式存在，可独立开发和发布
2. **延迟加载** - 支持按需加载，减少初始包体积
3. **函数式 API** - 使用函数创建模块，简单且易于测试
4. **类型安全** - 完整的 TypeScript 类型推导
5. **向后兼容** - 可以渐进式迁移现有代码

### 架构图

```
┌─────────────────────────────────────────────┐
│                   KieAI SDK                  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐      ┌──────────────┐    │
│  │  HttpClient │      │ Plugin System │    │
│  └──────┬──────┘      └──────┬───────┘    │
│         │                     │             │
│  ┌──────▼──────────────────────▼──────┐    │
│  │          Module Registry            │    │
│  └─────────────┬───────────────────────┘    │
│                │                            │
│  ┌─────────────▼───────────────────────┐    │
│  │            Plugins                   │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐        │    │
│  │  │ MJ   │ │ GPT  │ │ Jobs │  ...   │    │
│  │  └──────┘ └──────┘ └──────┘        │    │
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## 实现细节

### 1. 核心类型定义

```typescript
// core/types.ts
export interface SDKConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retry?: RetryConfig;
}

export interface Plugin<T = any> {
  name: string;
  version: string;
  factory: (client: HttpClient) => T;
  dependencies?: string[];
}

export interface ModuleFactory<T = any> {
  (client: HttpClient): T;
}
```

### 2. SDK 核心实现

```typescript
// core/KieAISDK.ts
export class KieAISDK {
  private readonly client: HttpClient;
  private readonly modules = new Map<string, any>();
  private readonly lazyLoaders = new Map<string, () => any>();

  constructor(config: SDKConfig) {
    this.client = new HttpClient(config);
  }

  /**
   * 立即加载插件
   */
  use<T>(plugin: Plugin<T>): this {
    this.validateDependencies(plugin);
    const instance = plugin.factory(this.client);
    this.modules.set(plugin.name, instance);
    return this;
  }

  /**
   * 延迟加载插件
   */
  lazy<T>(plugin: Plugin<T>): this {
    this.lazyLoaders.set(plugin.name, () => {
      if (!this.modules.has(plugin.name)) {
        this.validateDependencies(plugin);
        const instance = plugin.factory(this.client);
        this.modules.set(plugin.name, instance);
      }
      return this.modules.get(plugin.name);
    });
    return this;
  }

  /**
   * 获取模块实例
   */
  get<T>(name: string): T {
    if (this.modules.has(name)) {
      return this.modules.get(name);
    }
    
    const loader = this.lazyLoaders.get(name);
    if (loader) {
      return loader();
    }
    
    throw new Error(`Module "${name}" not found. Did you forget to register it?`);
  }

  /**
   * 批量注册插件
   */
  useMany(plugins: Plugin[]): this {
    plugins.forEach(plugin => this.use(plugin));
    return this;
  }

  /**
   * 检查插件依赖
   */
  private validateDependencies(plugin: Plugin): void {
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.modules.has(dep) && !this.lazyLoaders.has(dep)) {
          throw new Error(
            `Plugin "${plugin.name}" requires "${dep}" to be loaded first`
          );
        }
      }
    }
  }

  /**
   * 从配置创建 SDK
   */
  static create(config: SDKConfig, plugins?: Plugin[]): KieAISDK {
    const sdk = new KieAISDK(config);
    plugins?.forEach(plugin => sdk.use(plugin));
    return sdk;
  }
}
```

### 3. 插件实现示例

```typescript
// plugins/midjourney/types.ts
export interface MidjourneyAPI {
  imagine(options: ImagineOptions): Promise<ImagineResponse>;
  upscale(options: UpscaleOptions): Promise<UpscaleResponse>;
  variation(options: VariationOptions): Promise<VariationResponse>;
  getTask(taskId: string): Promise<TaskResponse>;
}

// plugins/midjourney/api.ts
export function createMidjourneyAPI(client: HttpClient): MidjourneyAPI {
  const baseURL = '/api/v1/midjourney';
  
  return {
    async imagine(options: ImagineOptions) {
      validateImagineOptions(options);
      return client.post(`${baseURL}/imagine`, options);
    },
    
    async upscale(options: UpscaleOptions) {
      validateUpscaleOptions(options);
      return client.post(`${baseURL}/upscale`, options);
    },
    
    async variation(options: VariationOptions) {
      return client.post(`${baseURL}/variation`, options);
    },
    
    async getTask(taskId: string) {
      if (!taskId) throw new Error('taskId is required');
      return client.get(`${baseURL}/task/${taskId}`);
    }
  };
}

// plugins/midjourney/index.ts
import { createMidjourneyAPI } from './api';
import type { Plugin } from '../../core/types';

export const MidjourneyPlugin: Plugin<MidjourneyAPI> = {
  name: 'midjourney',
  version: '1.0.0',
  factory: createMidjourneyAPI
};
```

### 4. 统一任务系统插件

```typescript
// plugins/jobs/types.ts
export interface JobsAPI {
  create<I, O>(model: string, input: I, callbackUrl?: string): Promise<TaskResponse>;
  getStatus(taskId: string): Promise<TaskStatus>;
  verifyCallback(data: unknown): Promise<any>;
  registerModel(model: string, config: ModelConfig): void;
}

// plugins/jobs/registry.ts
export class ModelRegistry {
  private models = new Map<string, ModelConfig>();
  
  register(model: string, config: ModelConfig): this {
    this.models.set(model, config);
    return this;
  }
  
  get(model: string): ModelConfig | undefined {
    return this.models.get(model);
  }
  
  has(model: string): boolean {
    return this.models.has(model);
  }
  
  list(): string[] {
    return Array.from(this.models.keys());
  }
}

// plugins/jobs/api.ts
export function createJobsAPI(
  client: HttpClient,
  registry: ModelRegistry
): JobsAPI {
  return {
    async create(model: string, input: any, callbackUrl?: string) {
      const config = registry.get(model);
      if (!config) {
        throw new Error(`Model "${model}" not registered`);
      }
      
      // 验证输入
      if (config.validateInput) {
        config.validateInput(input);
      }
      
      const response = await client.post('/api/v1/jobs/createTask', {
        model,
        input,
        callbackUrl
      });
      
      return response;
    },
    
    async getStatus(taskId: string) {
      if (!taskId) {
        throw new Error('taskId is required');
      }
      
      return client.get('/api/v1/jobs/recordInfo', { taskId });
    },
    
    async verifyCallback(data: unknown) {
      const payload = data as any;
      const model = payload?.data?.model;
      
      if (!model) {
        throw new Error('Invalid callback data: missing model');
      }
      
      const config = registry.get(model);
      if (config?.onCallback) {
        return config.onCallback(payload);
      }
      
      return payload.data;
    },
    
    registerModel(model: string, config: ModelConfig) {
      registry.register(model, config);
    }
  };
}

// plugins/jobs/index.ts
export const JobsPlugin: Plugin<JobsAPI> = {
  name: 'jobs',
  version: '1.0.0',
  factory: (client) => {
    const registry = new ModelRegistry();
    return createJobsAPI(client, registry);
  }
};
```

### 5. TypeScript 类型支持

```typescript
// types/modules.ts
import type { MidjourneyAPI } from '../plugins/midjourney';
import type { GPTAPI } from '../plugins/gpt';
import type { JobsAPI } from '../plugins/jobs';

/**
 * SDK 模块类型映射
 */
export interface SDKModules {
  midjourney: MidjourneyAPI;
  gpt: GPTAPI;
  jobs: JobsAPI;
  runway: RunwayAPI;
  veo3: Veo3API;
  fluxKontext: FluxKontextAPI;
}

/**
 * 类型安全的 SDK
 */
export class TypedKieAISDK extends KieAISDK {
  get<K extends keyof SDKModules>(name: K): SDKModules[K] {
    return super.get(name);
  }
}
```

## 迁移计划

### 第一阶段：兼容层（1-2周）

保持现有 API 不变，内部重构为插件架构：

```typescript
// legacy/adapter.ts
export class LegacyKieAISDK extends KieAISDK {
  constructor(config: SDKConfig) {
    super(config);
    
    // 自动加载所有旧模块作为插件
    this.use(createLegacyPlugin('gptImage', GPT4oImageModule))
        .use(createLegacyPlugin('midjourney', MidjourneyModule))
        .use(createLegacyPlugin('runway', RunwayModule));
  }
  
  // 保持旧的访问方式
  get gptImage() { return this.get('gptImage'); }
  get midjourney() { return this.get('midjourney'); }
  get runway() { return this.get('runway'); }
}

function createLegacyPlugin(name: string, ModuleClass: any): Plugin {
  return {
    name,
    version: '1.0.0',
    factory: (client) => new ModuleClass(client)
  };
}
```

### 第二阶段：逐步迁移（2-4周）

将现有模块逐个重构为函数式 API：

```typescript
// 旧代码
export class GPT4oImageModule extends BaseModule {
  async generateImage(options: GenerateImageOptions) {
    // ...
  }
}

// 新代码
export function createGPTAPI(client: HttpClient): GPTAPI {
  return {
    async generateImage(options: GenerateImageOptions) {
      // ...
    }
  };
}
```

### 第三阶段：文档和示例（1周）

- 更新所有文档
- 提供迁移指南
- 创建示例项目
- 发布新版本

## API 使用示例

### 基础使用

```typescript
import { KieAISDK } from 'kieai-sdk';
import { MidjourneyPlugin, GPTPlugin } from 'kieai-sdk/plugins';

// 创建 SDK 实例
const sdk = new KieAISDK({
  apiKey: process.env.KIEAI_API_KEY,
  baseURL: 'https://api.kie.ai',
  timeout: 30000
});

// 注册插件
sdk.use(MidjourneyPlugin)
   .use(GPTPlugin);

// 使用模块
const midjourney = sdk.get<MidjourneyAPI>('midjourney');
const result = await midjourney.imagine({
  prompt: 'a beautiful landscape',
  model: 'v6'
});
```

### 延迟加载

```typescript
// 只在需要时加载大型模块
sdk.lazy(RunwayPlugin)
   .lazy(Veo3Plugin);

// 第一次调用时才会初始化
const runway = sdk.get('runway'); // 此时才加载
```

### 配置驱动

```typescript
// config/sdk.config.ts
export default {
  apiKey: process.env.KIEAI_API_KEY,
  plugins: {
    immediate: ['midjourney', 'gpt'],
    lazy: ['runway', 'veo3', 'jobs']
  },
  models: {
    'midjourney/v6': { /* ... */ },
    'seedance/v1-pro': { /* ... */ }
  }
};

// main.ts
import config from './config/sdk.config';
const sdk = KieAISDK.fromConfig(config);
```

### 自定义插件

```typescript
// 创建自定义插件
const MyCustomPlugin: Plugin = {
  name: 'custom',
  version: '1.0.0',
  factory: (client) => ({
    async doSomething(data: any) {
      return client.post('/custom/endpoint', data);
    },
    
    async getSomething(id: string) {
      return client.get(`/custom/${id}`);
    }
  })
};

// 注册使用
sdk.use(MyCustomPlugin);
const custom = sdk.get('custom');
await custom.doSomething({ foo: 'bar' });
```

### 任务系统使用

```typescript
// 获取任务模块
const jobs = sdk.get<JobsAPI>('jobs');

// 注册模型
jobs.registerModel('midjourney/v6', {
  validateInput: (input) => {
    if (!input.prompt) throw new Error('prompt is required');
  },
  onCallback: (data) => {
    // 处理回调
    return data;
  }
});

// 创建任务
const task = await jobs.create('midjourney/v6', {
  prompt: 'a cat in space',
  quality: 'high'
});

// 查询状态
const status = await jobs.getStatus(task.taskId);
```

### 错误处理

```typescript
try {
  const result = await midjourney.imagine({ prompt: 'test' });
} catch (error) {
  if (error instanceof KieError) {
    if (error.isNetworkError()) {
      console.error('Network error:', error.message);
    } else if (error.isValidationError()) {
      console.error('Validation error:', error.message);
    } else if (error.isApiError()) {
      console.error('API error:', error.apiResponse);
    }
  }
}
```

### TypeScript 类型提示

```typescript
// 完整的类型推导
const sdk = new TypedKieAISDK({ apiKey: 'xxx' });

// IDE 会自动提示可用的模块名
const midjourney = sdk.get('midjourney'); // 类型: MidjourneyAPI

// 自动补全所有方法
await midjourney.imagine({
  prompt: 'test',     // IDE 提示必填
  model: 'v6',        // IDE 提示可选值
  quality: 'high'     // IDE 提示可选
});
```

## 性能优化

### Bundle Size 对比

```
当前架构：
- 全量加载: ~150KB (minified)
- 无法 tree-shaking

新架构：
- 核心 SDK: ~20KB
- 按需加载插件: 5-15KB each
- 支持 tree-shaking
```

### 加载时间优化

```typescript
// 测量插件加载时间
sdk.on('plugin:load', (name, duration) => {
  console.log(`Plugin ${name} loaded in ${duration}ms`);
});

// 预加载策略
if (window.requestIdleCallback) {
  requestIdleCallback(() => {
    sdk.preload(['runway', 'veo3']);
  });
}
```

## 测试策略

```typescript
// 插件单元测试
describe('MidjourneyPlugin', () => {
  it('should create instance', () => {
    const client = new MockHttpClient();
    const api = createMidjourneyAPI(client);
    expect(api).toBeDefined();
  });
  
  it('should call imagine endpoint', async () => {
    const client = new MockHttpClient();
    const api = createMidjourneyAPI(client);
    
    await api.imagine({ prompt: 'test' });
    
    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/midjourney/imagine',
      { prompt: 'test' }
    );
  });
});

// SDK 集成测试
describe('KieAISDK', () => {
  it('should register and use plugins', () => {
    const sdk = new KieAISDK({ apiKey: 'test' });
    sdk.use(TestPlugin);
    
    const module = sdk.get('test');
    expect(module).toBeDefined();
  });
});
```

## 发布计划

### 版本规划

- **v0.3.0** - 内部重构，保持 API 兼容
- **v0.4.0** - 引入插件系统，提供迁移工具
- **v1.0.0** - 移除旧 API，完全插件化

### NPM 发布

```json
{
  "name": "kieai-sdk",
  "version": "1.0.0",
  "main": "./lib/index.js",
  "module": "./lib/index.esm.js",
  "types": "./lib/index.d.ts",
  "exports": {
    ".": {
      "types": "./lib/index.d.ts",
      "import": "./lib/index.esm.js",
      "require": "./lib/index.js"
    },
    "./plugins": {
      "types": "./lib/plugins/index.d.ts",
      "import": "./lib/plugins/index.esm.js",
      "require": "./lib/plugins/index.js"
    },
    "./plugins/*": {
      "types": "./lib/plugins/*.d.ts",
      "import": "./lib/plugins/*.esm.js",
      "require": "./lib/plugins/*.js"
    }
  },
  "sideEffects": false
}
```

## 社区生态

### 插件开发指南

```typescript
// 第三方插件模板
export function createYourPlugin(): Plugin {
  return {
    name: 'your-plugin',
    version: '1.0.0',
    dependencies: ['jobs'], // 依赖其他插件
    factory: (client) => {
      // 你的实现
      return {
        async yourMethod() {
          // ...
        }
      };
    }
  };
}
```

### 插件市场

未来可以建立插件市场，让社区贡献更多 AI 服务集成：

```bash
# 安装社区插件
npm install @kieai/plugin-stability-ai
npm install @kieai/plugin-leonardo-ai

# 使用
import { StabilityPlugin } from '@kieai/plugin-stability-ai';
sdk.use(StabilityPlugin);
```

## 总结

这个新架构设计带来以下优势：

1. **更好的扩展性** - 插件化架构，易于添加新功能
2. **更小的包体积** - 按需加载，tree-shaking 友好
3. **更好的开发体验** - 完整的 TypeScript 支持
4. **更容易维护** - 模块解耦，职责清晰
5. **社区友好** - 第三方可以贡献插件

通过渐进式迁移，可以在不破坏现有用户代码的情况下完成架构升级。