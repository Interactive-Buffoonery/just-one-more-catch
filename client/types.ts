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
  name: string;
  types: string[];
  from: string | null;
  evo: string | null;
  baby: boolean;
  rows: Row[];
  all: Row[];
};
export type Mon = {
  id: number;
  n: number;
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
  auth: {
    isLoading: boolean;
    isAuthenticated: boolean;
    displayName?: string;
    email?: string;
  };
  runs: RunRow[] | undefined;
  avatar: number | null | undefined;
  setAvatar(n: number): Promise<unknown>;
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
  }): Promise<{ ok: boolean }>;
};
