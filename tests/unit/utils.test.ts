import { describe, it, expect } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("mescla classes condicionais", () => {
    expect(cn("text-white", false && "hidden", "font-bold")).toBe(
      "text-white font-bold",
    );
  });

  it("resolve conflitos do Tailwind mantendo a última classe", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
