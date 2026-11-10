import { Clerk } from "@clerk/clerk-js";
import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { mount, update, type Bridge } from "./app";

let clerk: Clerk | undefined;
const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL);

let auth: Bridge["auth"] = { isLoading: true, isAuthenticated: false };
let runs: Bridge["runs"];
let stopRuns: (() => void) | undefined;
let userId: string | null | undefined;

const bridge = (): Bridge => ({
  auth,
  runs: auth.isAuthenticated ? runs : [],
  signIn: () =>
    void clerk?.client?.signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    }),
  signOut: () => void clerk?.signOut(),
  createRun: (version) => convex.mutation(api.runs.create, { version }),
  saveRun: (id, state) => convex.mutation(api.runs.save, { id, state }),
  deleteRun: (id) => convex.mutation(api.runs.remove, { id }),
  deleteAccount: async () => {
    await convex.mutation(api.runs.deleteAccount, {});
    await clerk?.user?.delete();
  },
  contact: (input) => convex.mutation(api.runs.contact, input),
});
const render = () => update(bridge());

function onUser(user: Clerk["user"]) {
  const id = user?.id ?? null;
  if (id === userId) return;
  userId = id;
  stopRuns?.();
  stopRuns = runs = undefined;
  auth = { isLoading: !!user, isAuthenticated: false };
  convex.setAuth(
    async ({ forceRefreshToken }) =>
      (user && (await clerk?.session?.getToken({ template: "convex", skipCache: forceRefreshToken }))) ?? null,
    (ok) => {
      if (user && !ok) console.warn("Convex rejected the Clerk token");
      auth = {
        isLoading: false,
        isAuthenticated: ok,
        displayName: user?.firstName || user?.fullName || undefined,
        provider: ok ? "google" : null,
      };
      stopRuns?.();
      stopRuns = ok
        ? convex.onUpdate(api.runs.list, {}, (rows) => {
            runs = rows;
            render();
          })
        : undefined;
      render();
    },
  );
  render();
}

mount(document.getElementById("app")!, bridge());
try {
  clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  await clerk.load();
  if (location.pathname === "/sso-callback")
    await clerk.handleRedirectCallback({}, async () => history.replaceState(null, "", "/"));
  clerk.addListener(({ user }) => onUser(user));
} catch (err) {
  console.warn("Sign-in is unavailable; playing as a guest", err);
  onUser(null);
}
