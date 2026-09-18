/**
 * Safely serializes an object to JSON for embedding inside an HTML script tag (e.g., application/ld+json).
 *
 * Escapes characters that could be used for HTML tag injection or script breakout
 * (`<`, `>`, `&`, `\u2028`, `\u2029`) using standard Unicode escape sequences.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
