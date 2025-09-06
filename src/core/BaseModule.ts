import { HttpClient } from "./HttpClient";

export abstract class BaseModule {
  protected readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  protected validateParams(
    params: Record<string, any>,
    requiredKeys: string[]
  ): void {
    for (const key of requiredKeys) {
      if (!params[key]) {
        throw new Error(`Unvalid Params: ${key}`);
      }
    }
  }

  protected cleanParams(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}
