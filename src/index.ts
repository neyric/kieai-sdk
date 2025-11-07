/**
 * KieAI SDK 主入口文件
 * 插件化架构 - 所有功能以插件形式提供
 */

// ========== Core 导出 ==========
export { KieAISDK } from "./core/sdk";
export type {
  SDKConfig,
  Plugin,
  PluginContext,
  HttpClient,
} from "./core/types";
export { SDKError, SDKErrorKind } from "./core/errors";

// ========== 官方插件导出 ==========
export { MidjourneyPlugin } from "./plugins/midjourney";
export type { MidjourneyAPI } from "./plugins/midjourney";

export { SeeDanceV1Plugin } from "./plugins/seedance-v1";
export type { SeeDanceV1API } from "./plugins/seedance-v1";

export { GoogleVeo3Plugin } from "./plugins/google-veo3";
export type { GoogleVeo3API } from "./plugins/google-veo3";

export { GrokImaginePlugin } from "./plugins/grok-imagine";
export type { GrokImagineAPI } from "./plugins/grok-imagine";

export { Hailuo23Plugin } from "./plugins/hailuo-2-3";
export type { Hailuo23API } from "./plugins/hailuo-2-3";

export { Kling25Plugin } from "./plugins/kling-2-5";
export type { Kling25API } from "./plugins/kling-2-5";

export { Wan25Plugin } from "./plugins/wan-2-5";
export type { Wan25API } from "./plugins/wan-2-5";

// ========== 默认导出 ==========
import { KieAISDK } from "./core/sdk";
export default KieAISDK;
