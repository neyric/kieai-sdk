import { HttpClient } from "./HttpClient";
import { GPT4oImageModule } from "../modules/GPT4oImageModule";
import { FluxKontextModule } from "../modules/FluxKontextModule";
import { MidjourneyModule } from "../modules/MidjourneyModule";
import { RunwayModule } from "../modules/RunwayModule";
import { Veo3Module } from "../modules/Veo3Module";
import { createSeeDanceModules } from "../modules/jobs-module/see-dance";
import { createNanoBananaModules } from "../modules/jobs-module/nano-banana";
import { createSeedreamModules } from "../modules/jobs-module/seedream";

export interface SDKConfig {
  baseURL?: string;
  timeout?: number;
  apiKey: string;
}

export class KieAISDK {
  private readonly httpClient: HttpClient;

  public readonly gptImage: GPT4oImageModule;
  public readonly fluxKontext: FluxKontextModule;
  public readonly midjourney: MidjourneyModule;
  public readonly runway: RunwayModule;
  public readonly veo3: Veo3Module;
  public readonly seeDance: ReturnType<typeof createSeeDanceModules>;
  public readonly nanoBanana: ReturnType<typeof createNanoBananaModules>;
  public readonly seedream: ReturnType<typeof createSeedreamModules>;

  constructor(config: SDKConfig) {
    if (!config.apiKey) {
      throw new Error("API Key is required");
    }

    this.httpClient = new HttpClient({
      ...config,
      apiKey: config.apiKey,
    });

    // 初始化模块
    this.gptImage = new GPT4oImageModule(this.httpClient);
    this.fluxKontext = new FluxKontextModule(this.httpClient);
    this.midjourney = new MidjourneyModule(this.httpClient);
    this.runway = new RunwayModule(this.httpClient);
    this.veo3 = new Veo3Module(this.httpClient);
    this.seeDance = createSeeDanceModules(this.httpClient);
    this.nanoBanana = createNanoBananaModules(this.httpClient);
    this.seedream = createSeedreamModules(this.httpClient);
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
  static create(config: SDKConfig): KieAISDK {
    return new KieAISDK(config);
  }
}
