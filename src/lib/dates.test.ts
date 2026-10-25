// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatContentDate } from "@/lib/dates";

const cases = [
  ["2026-10-25", "Oct 25, 2026"],
  ["2026-01-01", "Jan 1, 2026"],
  ["2025-12-31", "Dec 31, 2025"],
  ["2028-02-29", "Feb 29, 2028"],
] as const;

describe("formatContentDate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(cases)("test_ac5_formats_%s_as_%s", (input, expected) => {
    expect(formatContentDate(input)).toBe(expected);
  });

  it.each([
    ["Pacific/Kiritimati", -840],
    ["Pacific/Pago_Pago", 660],
  ])("test_ac5_does_not_shift_the_day_in_%s", (zone, offset) => {
    vi.stubEnv("TZ", zone);
    expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(offset);
    for (const [input, expected] of cases) {
      expect(formatContentDate(input)).toBe(expected);
    }
  });

  it.each(["", "2026-1-5", "2026-02-30", "2026-10-25T00:00:00Z", "not a date"])(
    "test_ac5_rejects_%j with a RangeError",
    (input) => {
      expect(() => formatContentDate(input)).toThrow(RangeError);
    },
  );
});
