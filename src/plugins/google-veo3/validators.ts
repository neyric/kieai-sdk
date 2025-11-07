/**
 * Google Veo3 Plugin Validators
 */

import { createValidationError } from "../../core/errors";
import type { Veo3TextToVideoOptions, Veo3ImageToVideoOptions } from "./api";

/**
 * Validate text to video options
 */
export function validateTextToVideoOptions(
  options: Veo3TextToVideoOptions,
): void {
  if (!options.prompt) {
    throw createValidationError("prompt is required", { field: "prompt" });
  }

  if (typeof options.prompt !== "string" || options.prompt.trim() === "") {
    throw createValidationError("prompt must be a non-empty string", {
      field: "prompt",
    });
  }

  // Validate seeds range if provided
  if (options.seeds !== undefined) {
    if (
      typeof options.seeds !== "number" ||
      options.seeds < 10000 ||
      options.seeds > 99999
    ) {
      throw createValidationError(
        "seeds must be a number between 10000 and 99999",
        { field: "seeds" },
      );
    }
  }

  // Validate aspectRatio if provided
  if (options.aspectRatio && !["16:9", "9:16"].includes(options.aspectRatio)) {
    throw createValidationError('aspectRatio must be either "16:9" or "9:16"', {
      field: "aspectRatio",
    });
  }

  // Validate model if provided
  if (options.model && !["veo3", "veo3_fast"].includes(options.model)) {
    throw createValidationError('model must be either "veo3" or "veo3_fast"', {
      field: "model",
    });
  }
}

/**
 * Validate image to video options
 */
export function validateImageToVideoOptions(
  options: Veo3ImageToVideoOptions,
): void {
  // First validate common fields
  validateTextToVideoOptions(options);

  if (!options.imageUrl) {
    throw createValidationError("imageUrl is required", { field: "imageUrl" });
  }

  if (typeof options.imageUrl !== "string" || options.imageUrl.trim() === "") {
    throw createValidationError("imageUrl must be a non-empty string", {
      field: "imageUrl",
    });
  }

  // Basic URL validation
  try {
    new URL(options.imageUrl);
  } catch {
    throw createValidationError("imageUrl must be a valid URL", {
      field: "imageUrl",
    });
  }
}

/**
 * Validate task ID
 */
export function validateTaskId(taskId: string): void {
  if (!taskId) {
    throw createValidationError("taskId is required", { field: "taskId" });
  }

  if (typeof taskId !== "string" || taskId.trim() === "") {
    throw createValidationError("taskId must be a non-empty string", {
      field: "taskId",
    });
  }
}
