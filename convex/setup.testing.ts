/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import rateLimiter from "@convex-dev/rate-limiter/test";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
export const setup = () => {
  const t = convexTest(schema, modules);
  rateLimiter.register(t);
  return t;
};
