# KieAI SDK 架构重构方案

## 目录
- [现状分析](#现状分析)
- [架构设计方案](#架构设计方案)
- [实现细节](#实现细节)
- [落地计划](#落地计划)
- [API 使用示例](#api-使用示例)
- [总结](#总结)

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

KieAI SDK 全面采用插件化方案，所有能力都以 `Plugin` 的形式暴露，核心只负责 HTTP 能力、插件注册和生命周期管理。通过彻底解耦 Core 与调用侧（插件、上层业务），SDK 的扩展和维护只需围绕插件边界展开。

### 设计目标

1. **插件优先**：任何新能力都以插件交付，Core 不内置业务逻辑。
2. **核心解耦**：所有插件通过显式 `use` 注册，SDK 始终保持轻量、可预测的初始化流程。
3. **稳定类型系统**：插件可声明返回类型，`sdk.get<T>()` 直接获得对应 API。
4. **可观测性**：插件生命周期钩子提供日志、性能追踪与诊断切入点。
5. **破坏式升级**：无需兼容层，无需渐进迁移，直接切换到插件体系。

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
│  │  ┌──────┐ ┌──────┐ ┌────────┐       │    │
│  │  │ MJ   │ │ GPT  │ │ Runway │  ...  │    │
│  │  └──────┘ └──────┘ └────────┘       │    │
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 核心流程

1. Core 初始化 HTTP 客户端和模块注册表。
2. 插件通过 `use` 接口注册，Core 在注册时完成依赖校验与实例化。
3. `sdk.get(name)` 返回插件实例；若未注册则直接抛出异常提醒开发者。
4. 插件可互相依赖，但依赖关系由 Core 统一校验，整体运行在 NodeJS 后端环境。

### 插件分类

- **内置插件**：由官方维护，例如 Midjourney、GPT、Runway 等。
- **扩展插件**：与业务强相关的私有插件，可放置在项目内部。
- **第三方插件**：社区分发，通过包管理器引入。

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
  onInit?: (ctx: { config: SDKConfig }) => void;
  onDispose?: () => void;
}
```

### 2. SDK 核心实现

```typescript
// core/KieAISDK.ts
export class KieAISDK {
  private readonly client: HttpClient;
  private readonly modules = new Map<string, any>();

  constructor(config: SDKConfig) {
    this.client = new HttpClient(config);
  }

  use<T>(plugin: Plugin<T>): this {
    this.validateDependencies(plugin);
    plugin.onInit?.({ config: this.client.config });
    const instance = plugin.factory(this.client);
    this.modules.set(plugin.name, instance);
    return this;
  }

  get<T>(name: string): T {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Plugin "${name}" not found. Did you forget to register it?`);
    }
    return module;
  }

  useMany(plugins: Plugin[]): this {
    plugins.forEach(plugin => this.use(plugin));
    return this;
  }

  dispose(): void {
    this.modules.clear();
  }

  private validateDependencies(plugin: Plugin): void {
    plugin.dependencies?.forEach(dep => {
      if (!this.modules.has(dep)) {
        throw new Error(`Plugin "${plugin.name}" requires "${dep}" to be registered first`);
      }
    });
  }
}
```

### 3. 插件实现示例

```typescript
// plugins/midjourney/api.ts
export interface MidjourneyAPI {
  imagine(options: ImagineOptions): Promise<ImagineResponse>;
  upscale(options: UpscaleOptions): Promise<UpscaleResponse>;
  variation(options: VariationOptions): Promise<VariationResponse>;
  getTask(taskId: string): Promise<TaskResponse>;
}

export const MidjourneyPlugin: Plugin<MidjourneyAPI> = {
  name: 'midjourney',
  version: '1.0.0',
  factory: (client) => {
    const baseURL = '/api/v1/midjourney';
    return {
      imagine(options) {
        validateImagineOptions(options);
        return client.post(`${baseURL}/imagine`, options);
      },
      upscale(options) {
        validateUpscaleOptions(options);
        return client.post(`${baseURL}/upscale`, options);
      },
      variation(options) {
        return client.post(`${baseURL}/variation`, options);
      },
      getTask(taskId) {
        if (!taskId) throw new Error('taskId is required');
        return client.get(`${baseURL}/task/${taskId}`);
      }
    };
  }
};
```

```typescript
// plugins/gpt/index.ts
export interface GPTAPI {
  chat(options: ChatCompletionOptions): Promise<ChatCompletion>;
  generateImage(options: GenerateImageOptions): Promise<ImageResponse>;
}

export const GPTPlugin: Plugin<GPTAPI> = {
  name: 'gpt',
  version: '1.0.0',
  factory: (client) => ({
    chat(options) {
      return client.post('/api/v1/gpt/chat', options);
    },
    generateImage(options) {
      return client.post('/api/v1/gpt/image', options);
    }
  })
};
```

### 4. 插件生命周期与依赖管理

- 插件注册即执行 `onInit`，可用于注入日志、上报信息或环境校验。
- `dependencies` 字段描述软依赖，Core 在 `use` 阶段统一校验。
- 插件之间通过 `sdk.get()` 访问彼此，避免直接导入，从而保持核心解耦。
- `dispose` 保留清理钩子，便于在测试或多实例场景释放资源。

### 5. 错误处理与诊断

- Core 捕获插件初始化异常并附带插件名称，便于快速定位。
- HttpClient 统一输出请求 ID、耗时，插件层只需要关注业务逻辑。
- 通过中间件扩展（如请求重试、节流）时，插件无需改动，只需在 Core 中配置。

## 落地计划

1. **Core 重写（第 1 周）**  
   - 实现新的 `KieAISDK`、`Plugin` 类型、HttpClient 扩展点。  
   - 建立自动化测试覆盖核心注册与依赖校验。

2. **内置模块插件化（第 2-3 周）**  
   - Midjourney、GPT、Runway、SeeDance 等全部以插件形式输出。  
   - 统一导出路径 `kieai-sdk/plugins/*`，移除旧的 class/module 暴露方式。

3. **文档与示例同步（第 3 周）**  
   - 重写 README、API 文档与示例项目，仅展示插件化 API。  
   - 输出升级说明：直接迁移至插件 API，不提供兼容层。

4. **发布与反馈（第 4 周）**  
   - 发布破坏式版本 `v1.0.0`，提醒用户更新调用方式。  
   - 收集社区反馈，为后续插件市场与脚手架做准备。

## API 使用示例

```typescript
import { KieAISDK } from 'kieai-sdk';
import { MidjourneyPlugin, GPTPlugin } from 'kieai-sdk/plugins';

const sdk = new KieAISDK({
  apiKey: process.env.KIEAI_API_KEY!,
  baseURL: 'https://api.kie.ai',
  timeout: 30000
});

sdk.use(MidjourneyPlugin)
   .use(GPTPlugin);

const midjourney = sdk.get<MidjourneyAPI>('midjourney');
const imagineResult = await midjourney.imagine({
  prompt: 'a beautiful landscape',
  model: 'v6'
});

const gpt = sdk.get<GPTAPI>('gpt');
const completion = await gpt.chat({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello KieAI' }]
});
```

## 总结

1. **完全插件化**：Core 与调用方解耦，新增能力只需发布插件。
2. **显式加载**：通过 `use` 注册即可完成实例化，NodeJS 场景下流程更可控。
3. **类型安全**：插件实现决定返回类型，`sdk.get<T>()` 即获得推导。
4. **更好维护性**：插件边界清晰，可独立测试与发布。
5. **社区友好**：内置开发模板与市场，让第三方轻松扩展 KieAI。
