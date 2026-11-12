import { expect, test } from "vitest";
import { importDate } from "../client/save-import";

test.each(["2010-03-14", "2024-02-29", "2000-01-01", "1996-02-27"])("preserves the calendar day %s", day => {
  const date = new Date(importDate(day)!);
  expect([date.getFullYear(), date.getMonth() + 1, date.getDate()]).toEqual(day.split("-").map(Number));
  expect(date.getHours()).toBe(0);
});

test.each(["2023-02-29", "2010-04-31", "2000-13-01", "2000-00-01", "0010-01-01", "1969-01-01", "9999-12-31", "2010-3-14", "<script>", ""])("rejects invalid or future calendar days %s", day => {
  expect(importDate(day)).toBeUndefined();
});
