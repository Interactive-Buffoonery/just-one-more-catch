import { expect, it } from "vitest";
import { mergeCaughtState, unmergeCaughtState, validateSaveLink, saveFingerprint, newSaveSalt, sameSaveLink, caughtOf } from "../shared/save-import";
import { MAX_RUN_BYTES } from "../shared/limits";

it("merges only caught and preserves all other state", () => {
  const other = { badges: ["a"], events: { a: true }, notes: "hi", mons: [{ n: 1 }], forms: [2], genders: { a: 1 }, boxNames: ["a"], unknown: { x: [1, "x"] } };
  const state = JSON.stringify({ ...other, caught: [999, 1, 0.5, "bad"] });
  const result = mergeCaughtState(state, "red", [25, 1]);
  expect(result.added).toEqual([25]);
  expect(JSON.parse(result.state)).toEqual({ ...other, caught: [0.5, 1, 25, 999] });
  expect(mergeCaughtState(result.state, "red", [25, 1]).added).toEqual([]);
  expect(JSON.parse(unmergeCaughtState(result.state, [25]))).toEqual({ ...other, caught: [0.5, 1, 999] });
  expect(caughtOf(JSON.parse(state))).toEqual([999, 1, 0.5]);
  expect(caughtOf(null)).toEqual([]);
});
it("rejects invalid data and oversized results", () => {
  for (const state of ["bad", "null", "[]", "1"]) expect(() => mergeCaughtState(state, "red", [])).toThrow();
  for (const caught of [[0], [152], [1.5], [1, 1], [NaN]]) expect(() => mergeCaughtState("{}", "red", caught)).toThrow();
  expect(() => mergeCaughtState("{}", "unknown", [])).toThrow();
  expect(() => mergeCaughtState(JSON.stringify({ notes: "x".repeat(MAX_RUN_BYTES) }), "red", [])).toThrow();
  for (const state of ["bad", "[]"]) expect(() => unmergeCaughtState(state, [])).toThrow();
  expect(() => unmergeCaughtState("{}", [1.5])).toThrow();
});
it("validates links and hashes stable, normalized, salted fingerprints", async () => {
  const salt = newSaveSalt();
  const fingerprint = await saveFingerprint(salt, "red", 123, "Lyra");
  expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(await saveFingerprint(salt, "red", 123, " Lyra ")).toBe(fingerprint);
  expect(await saveFingerprint(salt, "red", 123, "Amélie")).toBe(await saveFingerprint(salt, "red", 123, "Amélie"));
  expect(await saveFingerprint(newSaveSalt(), "red", 123, "Lyra")).not.toBe(fingerprint);
  expect(await saveFingerprint(salt, "red", 124, "Lyra")).not.toBe(fingerprint);
  validateSaveLink({ salt, fingerprint, playSeconds: 0 });
  for (const link of [{ salt: "", fingerprint }, { salt, fingerprint: "A".repeat(64) }, { salt, fingerprint, playSeconds: -1 }, { salt, fingerprint, playSeconds: 0.5 }])
    expect(() => validateSaveLink(link)).toThrow();
  expect(sameSaveLink({ salt, fingerprint, playSeconds: 0 }, { salt, fingerprint, playSeconds: 0 })).toBe(true);
  expect(sameSaveLink({ salt, fingerprint, playSeconds: 0 }, { salt, fingerprint })).toBe(false);
  expect(sameSaveLink(undefined, undefined)).toBe(true);
});
