import { describe, it, expect } from "vitest";
import { isAllowedFlagUrl } from "./ShareCard";

describe("isAllowedFlagUrl", () => {
  it("allows trusted flag domains", () => {
    expect(isAllowedFlagUrl("https://flagcdn.com/us.svg")).toBe(true);
    expect(isAllowedFlagUrl("https://flagcdn.com/w320/us.png")).toBe(true);
    expect(isAllowedFlagUrl("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")).toBe(true);
    expect(isAllowedFlagUrl("http://flagcdn.com/ca.svg")).toBe(true);
  });

  it("rejects untrusted domains and invalid URLs", () => {
    expect(isAllowedFlagUrl("https://evil.com/flag.svg")).toBe(false);
    expect(isAllowedFlagUrl("https://attacker.com/flagcdn.com/fake.png")).toBe(false);
    expect(isAllowedFlagUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isAllowedFlagUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedFlagUrl("not-a-valid-url")).toBe(false);
    expect(isAllowedFlagUrl("file:///etc/passwd")).toBe(false);
  });
});
