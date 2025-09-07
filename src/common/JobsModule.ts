import { BaseModule } from "../core/BaseModule";
import { createValidationError } from "../types/errors";

interface CreateJobsOptions<M = "", I = {}> {
  model: M;
  input: I;
  callbackUrl?: string;
}

type JobsState = "waiting" | "queuing" | "generating" | "success" | "fail";

interface JobsResult<M = ""> {
  taskId: string;
  model: M;
  state: JobsState;
  param: string;
  resultJson: string | null;
  failCode: number | null;
  failMsg: string | null;
  completeTime: number | null;
  createTime: number;
  updateTime: number;
}

/** 通用任务系统模块 */
export class JobsModule<I = {}, R = {}, M = ""> extends BaseModule {
  constructor(
    private model: M,
    ...config: ConstructorParameters<typeof BaseModule>
  ) {
    super(...config);
  }

  /** 创建任务 */
  async createTask(request: { input: I; callBackUrl?: string }) {
    if (!request.input) {
      throw createValidationError("input is required");
    }

    const options: CreateJobsOptions<M, I> = {
      model: this.model,
      ...request,
    };

    return this.httpClient.post<{ taskId: string }>(
      "/api/v1/jobs/createTask",
      options
    );
  }

  /** 查询任务记录 */
  async getTaskRecord(taskId: string) {
    if (!taskId) {
      throw createValidationError("taskId is required");
    }

    const task = await this.httpClient.get<JobsResult<M>>(
      "/api/v1/jobs/recordInfo",
      {
        taskId,
      }
    );

    const { param: requestParam, resultJson, ...rest } = task;

    let param: I, result: R | null;

    try {
      param = JSON.parse(requestParam);
    } catch {
      param = {} as I;
    }

    try {
      if (resultJson) result = JSON.parse(resultJson);
      else result = null;
    } catch {
      result = null;
    }

    return { ...rest, param, result, resultJson };
  }

  async verifyCallback(data: unknown) {
    const values = data as APIResponse<JobsResult<M>>;
    if (!values.data) {
      throw createValidationError("Unvalid callback data");
    }

    const { data: task } = values;

    const { param: requestParam, resultJson, ...rest } = task;

    let param: I, result: R | null;

    try {
      param = JSON.parse(requestParam);
    } catch {
      param = {} as I;
    }

    try {
      if (resultJson) result = JSON.parse(resultJson);
      else result = null;
    } catch {
      result = null;
    }

    return { ...rest, param, result, resultJson };
  }
}
