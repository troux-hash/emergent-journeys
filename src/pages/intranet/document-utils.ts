const FALLBACK_TITLE_MAX_LENGTH = 80;

export const deriveDocumentTitle = (title: string, content: string) => {
  const trimmedTitle = title.trim();

  if (trimmedTitle) {
    return trimmedTitle;
  }

  const fallbackLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!fallbackLine) {
    return "";
  }

  if (fallbackLine.length <= FALLBACK_TITLE_MAX_LENGTH) {
    return fallbackLine;
  }

  return `${fallbackLine.slice(0, FALLBACK_TITLE_MAX_LENGTH - 3).trimEnd()}...`;
};