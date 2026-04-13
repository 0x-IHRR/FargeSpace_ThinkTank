const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

function parseBooleanFlag(value: string | undefined) {
  if (value == null) return null;

  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;

  return null;
}

export function isOpenPreviewMode() {
  const explicitValue =
    parseBooleanFlag(process.env.OPEN_PREVIEW_MODE) ??
    parseBooleanFlag(process.env.NEXT_PUBLIC_OPEN_PREVIEW_MODE);

  if (explicitValue != null) {
    return explicitValue;
  }

  return process.env.NODE_ENV !== "production";
}
