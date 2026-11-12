import { Summary } from "../shared/summary";

export type Row = {
  place: string;
  chap: number;
  m: string;
  need: string[] | null;
  cond: string[];
  lo: number;
  hi: number;
  c: number;
  v: string;
};
export type Species = {
  n: number;
  j: number | null;
  genderRate: number;
  name: string;
  types: string[];
  from: string | null;
  evo: string | null;
  baby: boolean;
  forms?: { id: string; name: string; trade?: true }[];
  rows: Row[];
  all: Row[];
};
export type Mon = {
  id: number;
  n: number;
  form?: string;
  box: "party" | number;
  nick: string;
  lvl: number | "";
  g: string;
  shiny: boolean;
  item: string;
  note: string;
};
export type RunRow = {
  id: string;
  version: string;
  summary: Summary;
  createdAt: string;
  updatedAt?: string;
};
export type Bridge = {
  track(name: import("convex/values").Infer<typeof import("../convex/schema").eventName>, version?: string): void;
  auth: {
    isLoading: boolean;
    isAuthenticated: boolean;
    displayName?: string;
    email?: string;
  };
  runs: RunRow[] | undefined;
  avatar: number | null | undefined;
  setAvatar(n: number): Promise<unknown>;
  theme: { look: string; mode: string } | null | undefined;
  setTheme(look: string, mode: string): Promise<unknown>;
  getState(id: string): Promise<string>;
  mountSignIn(el: HTMLDivElement): boolean;
  unmountSignIn(el: HTMLDivElement): void;
  signOut(): void;
  createRun(version: string): Promise<string>;
  saveRun(id: string, state: string): Promise<unknown>;
  deleteRun(id: string): Promise<unknown>;
  setStart(id: string, startedAt: number): Promise<unknown>;
  deleteAccount(): Promise<unknown>;
  contact(input: {
    email: string;
    message: string;
    website: string;
  }): Promise<{ ok: boolean; retryAfterSeconds?: number }>;
};
