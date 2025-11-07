# KieAI SDK 插件化使用示例

本文档演示如何使用重构后的插件化 KieAI SDK。

## 基本使用

```typescript
import { KieAISDK, MidjourneyPlugin } from 'kieai-sdk';
import type { MidjourneyAPI } from 'kieai-sdk';

// 1. 创建 SDK 实例
const sdk = new KieAISDK({
  apiKey: process.env.KIEAI_API_KEY!,
  baseURL: 'https://api.kie.ai',
  timeout: 30000,
});

// 2. 注册插件
sdk.use(MidjourneyPlugin);

// 3. 获取插件实例并使用
const midjourney = sdk.get<MidjourneyAPI>('midjourney');

// 4. 调用 API
const result = await midjourney.generateTextToImage({
  prompt: 'a beautiful landscape with mountains and rivers',
  version: '7',
  aspectRatio: '16:9',
});

console.log('Task ID:', result.taskId);

// 5. 查询任务状态
const taskDetails = await midjourney.getTaskDetails(result.taskId);
console.log('Task status:', taskDetails.successFlag);
```

## 批量注册插件

```typescript
import { KieAISDK, MidjourneyPlugin } from 'kieai-sdk';

const sdk = new KieAISDK({
  apiKey: process.env.KIEAI_API_KEY!,
});

// 使用链式调用注册多个插件
sdk
  .use(MidjourneyPlugin)
  // .use(GPTPlugin)
  // .use(RunwayPlugin)
  ;

// 或者使用 useMany
sdk.useMany([
  MidjourneyPlugin,
  // GPTPlugin,
  // RunwayPlugin,
]);
```

## 错误处理

```typescript
import { KieAISDK, MidjourneyPlugin, SDKError, SDKErrorKind } from 'kieai-sdk';

const sdk = new KieAISDK({
  apiKey: process.env.KIEAI_API_KEY!,
});

sdk.use(MidjourneyPlugin);

try {
  const midjourney = sdk.get('midjourney');
  const result = await midjourney.generateTextToImage({
    prompt: 'test',
  });
} catch (error) {
  if (error instanceof SDKError) {
    console.error('SDK Error:', error.kind);
    console.error('Message:', error.message);
    console.error('Context:', error.context);

    if (error.isNetworkError()) {
      console.error('Network issue detected');
    } else if (error.isConfigError()) {
      console.error('Configuration error');
    } else if (error.isPluginError()) {
      console.error('Plugin error');
    }
  }
}
```

## 检查插件状态

```typescript
const sdk = new KieAISDK({ apiKey: 'your-key' });

// 检查插件是否已注册
if (!sdk.has('midjourney')) {
  sdk.use(MidjourneyPlugin);
}

// 获取所有已注册的插件
const plugins = sdk.getRegisteredPlugins();
console.log('Registered plugins:', plugins);

// 获取插件元数据
const metadata = sdk.getPluginMetadata('midjourney');
console.log('Plugin version:', metadata?.version);
console.log('Plugin description:', metadata?.meta?.description);
```

## 资源清理

```typescript
const sdk = new KieAISDK({ apiKey: 'your-key' });
sdk.use(MidjourneyPlugin);

// ... 使用 SDK

// 清理资源
await sdk.dispose();
```

## 完整示例

```typescript
import { KieAISDK, MidjourneyPlugin } from 'kieai-sdk';
import type { MidjourneyAPI } from 'kieai-sdk';

async function main() {
  // 初始化 SDK
  const sdk = new KieAISDK({
    apiKey: process.env.KIEAI_API_KEY!,
    baseURL: 'https://api.kie.ai',
    timeout: 60000,
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
    },
  });

  // 注册 Midjourney 插件
  sdk.use(MidjourneyPlugin);

  // 获取插件实例
  const midjourney = sdk.get<MidjourneyAPI>('midjourney');

  try {
    // 文本生成图片
    console.log('Generating image from text...');
    const textResult = await midjourney.generateTextToImage({
      prompt: 'a serene Japanese garden with cherry blossoms',
      version: '7',
      aspectRatio: '16:9',
      stylization: 500,
    });
    console.log('Text-to-image task created:', textResult.taskId);

    // 等待任务完成（轮询）
    let taskDetails = await midjourney.getTaskDetails(textResult.taskId);
    while (taskDetails.successFlag === 0) {
      console.log('Task is still processing...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      taskDetails = await midjourney.getTaskDetails(textResult.taskId);
    }

    if (taskDetails.successFlag === 1) {
      console.log('Image generated successfully!');
      console.log('Result URLs:', taskDetails.resultInfoJson?.resultUrls);

      // 图片放大
      console.log('Upscaling image...');
      const upscaleResult = await midjourney.upscale({
        taskId: textResult.taskId,
        imageIndex: 1,
      });
      console.log('Upscale task created:', upscaleResult.taskId);
    } else {
      console.error('Task failed:', taskDetails.errorMessage);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // 清理资源
    await sdk.dispose();
  }
}

main();
```

## 核心架构优势

1. **按需加载**：只注册需要使用的插件，减少初始化开销
2. **类型安全**：通过 TypeScript 泛型获得完整的类型推导
3. **清晰的依赖管理**：插件之间的依赖关系显式声明
4. **统一的错误处理**：所有错误都继承自 SDKError
5. **易于扩展**：添加新功能只需创建新插件，无需修改核心代码
