import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "./jsonLd";

describe("serializeJsonLd", () => {
  it("serializes normal objects into JSON string", () => {
    const data = { name: "France", region: "Europe" };
    expect(serializeJsonLd(data)).toBe('{"name":"France","region":"Europe"}');
  });

  it("escapes script tags to prevent XSS breakout", () => {
    const data = {
      name: "</script><script>alert('xss')</script>",
    };
    const serialized = serializeJsonLd(data);
    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<script>");
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(serialized).toContain("\\u003cscript\\u003e");

    // Must be valid JSON when unescaped/parsed
    expect(JSON.parse(serialized)).toEqual(data);
  });

  it("escapes HTML special characters (&, <, >)", () => {
    const data = { html: "AT&T < -> >" };
    const serialized = serializeJsonLd(data);
    expect(serialized).toContain("\\u0026");
    expect(serialized).toContain("\\u003c");
    expect(serialized).toContain("\\u003e");
    expect(JSON.parse(serialized)).toEqual(data);
  });

  it("escapes line and paragraph separators (\u2028, \u2029)", () => {
    const data = { text: "line1\u2028line2\u2029line3" };
    const serialized = serializeJsonLd(data);
    expect(serialized).toContain("\\u2028");
    expect(serialized).toContain("\\u2029");
    expect(JSON.parse(serialized)).toEqual(data);
  });
});
