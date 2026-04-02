import { describe, expect, it } from "vitest";

import { deriveDocumentTitle } from "@/pages/intranet/document-utils";

describe("deriveDocumentTitle", () => {
  it("prefers the entered title", () => {
    expect(deriveDocumentTitle("  SOP checklist  ", "Ignored content")).toBe("SOP checklist");
  });

  it("falls back to the first non-empty content line", () => {
    expect(deriveDocumentTitle("", "\n\nEnglish\nhttps://example.com")).toBe("English");
  });

  it("returns an empty string when both title and content are blank", () => {
    expect(deriveDocumentTitle("   ", "\n  \n")).toBe("");
  });
});