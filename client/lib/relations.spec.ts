// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

// This test file previously covered localStorage-backed helpers that were removed.
// In DB-only mode, these behaviors are validated via integration tests against the API.

describe("relations DB-only mode", () => {
  it("placeholder", () => {
    expect(true).toBe(true);
  });
});
