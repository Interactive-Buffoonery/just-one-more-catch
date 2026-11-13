/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as contactSpam from "../contactSpam.js";
import type * as crons from "../crons.js";
import type * as devices from "../devices.js";
import type * as email from "../email.js";
import type * as events from "../events.js";
import type * as pairing from "../pairing.js";
import type * as quotaKeys from "../quotaKeys.js";
import type * as runs from "../runs.js";
import type * as http from "../http.js";
import type * as shareReader from "../shareReader.js";
import type * as shares from "../shares.js";
import type * as stats from "../stats.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  contactSpam: typeof contactSpam;
  crons: typeof crons;
  devices: typeof devices;
  email: typeof email;
  events: typeof events;
  pairing: typeof pairing;
  quotaKeys: typeof quotaKeys;
  runs: typeof runs;
  http: typeof http;
  shareReader: typeof shareReader;
  shares: typeof shares;
  stats: typeof stats;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
