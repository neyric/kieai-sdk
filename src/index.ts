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

// ========== 默认导出 ==========
import { KieAISDK } from "./core/sdk";
export default KieAISDK;
