import { describe, it, expect, beforeEach } from "vitest";
import { useProgressStore } from "@/store/progressStore.js";

describe("progressStore", () => {
  beforeEach(() => {
    useProgressStore.setState({ progress: {} });
  });

  it("marks a module complete", () => {
    useProgressStore.getState().markModuleComplete("course-1", "module-1");
    expect(useProgressStore.getState().isModuleComplete("course-1", "module-1")).toBe(true);
  });

  it("calculates course progress percentage", () => {
    useProgressStore.getState().markModuleComplete("course-1", "module-1");
    const percent = useProgressStore.getState().getCourseProgress("course-1", 2);
    expect(percent).toBe(50);
  });
});
