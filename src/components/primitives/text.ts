/** Returns the value unchanged, or throws so an empty required text fails the build. */
export function requireText(value: string, label: string): string {
  if (value.trim() === "") {
    throw new Error(`${label} must not be empty`);
  }
  return value;
}

/** True only for a string with non-whitespace content. */
export function hasText(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== "";
}
