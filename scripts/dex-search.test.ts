import { expect, test } from "vitest";
import { searchDex } from "../client/views/dex";
import type { Species } from "../client/types";

const species = (name: string, n: number, j: number, types: string[] = [], forms: Species["forms"] = []): Species =>
  ({ name, n, j, types, forms, rows: [], all: [], genderRate: 4, from: null, evo: null, baby: false });
const pikachu = species("Pikachu", 25, 22, ["electric"]);
const raichu = species("Raichu", 26, 23, ["electric"], [{ id: "alola", name: "Alolan" }]);
const list = [raichu, pikachu].map((p) => ({ p }));
const forms = (p: Species) => p.forms || [];
const search = (q: string, visible = forms) => searchDex(list, q, (p) => p.j!, visible).map(({ p }) => p.name);

test("matches regional and national number prefixes", () => {
  expect(search("22")).toEqual(["Pikachu"]);
  expect(search("25")).toEqual(["Pikachu"]);
  expect(search("2")).toEqual(["Raichu", "Pikachu"]);
  expect(search("#025")).toEqual(["Pikachu"]);
});
test("matches types and form names without case sensitivity", () => {
  expect(search("ELECTRIC")).toEqual(["Raichu", "Pikachu"]);
  expect(search("ALOL")).toEqual(["Raichu"]);
});
test("strips a leading # for names", () => {
  expect(search("#pika")).toEqual(["Pikachu"]);
});
test("matches only visible forms and only for two or more letters", () => {
  expect(search("alol", () => [])).toEqual([]);
  expect(search("l")).toEqual([]);
  expect(search("al")).toEqual(["Raichu"]);
});
test("puts name prefixes first and preserves other order", () => {
  const rows = ["Raichu", "Pikachu", "Pichu"].map((name) => ({ p: species(name, 1, 1) }));
  expect(searchDex(rows, "pi", (p) => p.n, forms).map(({ p }) => p.name)).toEqual(["Pikachu", "Pichu"]);
  expect(search("chu")).toEqual(["Raichu", "Pikachu"]);
});
