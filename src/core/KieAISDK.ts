import { HttpClient } from "./HttpClient";
import { GPT4oImageModule } from "../modules/GPT4oImageModule";
import { FluxKontextModule } from "../modules/FluxKontextModule";
import { MidjourneyModule } from "../modules/MidjourneyModule";
import { RunwayModule } from "../modules/RunwayModule";
import { Veo3Module } from "../modules/Veo3Module";
import { createSeeDanceModules } from "../modules/jobs-module/see-dance";
import { createIdeogramModules } from "../modules/jobs-module/ideogram";
import { createIdeogramCharacterModules } from "../modules/jobs-module/ideogramCharacter";
import { createImagen4Modules } from "../modules/jobs-module/imagen4";
import { createWan22Modules } from "../modules/jobs-module/wan22";
import { createNanoBananaModules } from "../modules/jobs-module/nano-banana";
import { createSeedreamModules } from "../modules/jobs-module/seedream";
import { createKlingModules } from "../modules/jobs-module/kling";
import { createImageEditModules } from "../modules/jobs-module/image-edit";

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
  public readonly ideogram: ReturnType<typeof createIdeogramModules>;
  public readonly ideogramCharacter: ReturnType<typeof createIdeogramCharacterModules>;
  public readonly imagen4: ReturnType<typeof createImagen4Modules>;
  public readonly wan22: ReturnType<typeof createWan22Modules>;
  public readonly nanoBanana: ReturnType<typeof createNanoBananaModules>;
  public readonly seedream: ReturnType<typeof createSeedreamModules>;
  public readonly kling: ReturnType<typeof createKlingModules>;
  public readonly imageEdit: ReturnType<typeof createImageEditModules>;

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
    this.ideogram = createIdeogramModules(this.httpClient);
    this.ideogramCharacter = createIdeogramCharacterModules(this.httpClient);
    this.imagen4 = createImagen4Modules(this.httpClient);
    this.wan22 = createWan22Modules(this.httpClient);
    this.nanoBanana = createNanoBananaModules(this.httpClient);
    this.seedream = createSeedreamModules(this.httpClient);
    this.kling = createKlingModules(this.httpClient);
    this.imageEdit = createImageEditModules(this.httpClient);
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
