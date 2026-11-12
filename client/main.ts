import "@fontsource/jetbrains-mono/latin-500.css";
import type { Clerk } from "@clerk/clerk-js";
import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Bridge, Device } from "./types";

const legacyTab = new URLSearchParams(location.search).get("tab");
if (location.pathname === "/" && legacyTab === "contact") {
  location.replace("/contact/");
} else if (/^\/contact\/?$/.test(location.pathname)) {
  void startContact().catch(() => {
    document.getElementById("contact-status")!.textContent =
      "The form couldn't load. Please reload to try again.";
  });
} else {
  void startTracker();
}

async function startContact() {
  const { mountContact } = await import("./contact");
  const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
  let session: Promise<Clerk> | undefined;
  mountContact(async (input) => {
    if (/(?:^|;\s*)__client_uat(?:_[^=]*)?=(?!0(?:;|$))[^;]/.test(document.cookie) || session) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          (async () => {
            const c = await (session ??= (async () => {
              const [{ Clerk }, { ui }] = await Promise.all([
                import("@clerk/clerk-js"), import("@clerk/ui"),
              ]);
              const c = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
              await c.load({ ui });
              return c;
            })().catch((error) => { session = undefined; throw error; }));
            if (!c.user) {
              convex.setAuth(async () => null);
              return;
            }
            await new Promise<void>((resolve, reject) => {
              convex.setAuth(
                ({ forceRefreshToken }) => sessionToken(c, forceRefreshToken),
                (ok) => ok ? resolve() : reject(new Error("Session couldn't be restored")),
              );
            });
          })(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("Session timed out")), 10000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    }
    return convex.mutation(api.runs.contact, input);
  });
}

function deviceLabel() {
  const ua = navigator.userAgent;
  const browser = ([
    ["Edg/", "Edge"], ["SamsungBrowser/", "Samsung Internet"], ["Firefox/", "Firefox"], ["FxiOS/", "Firefox"],
    ["CriOS/", "Chrome"], ["Chrome/", "Chrome"], ["Safari/", "Safari"],
  ] as const).find(([key]) => ua.includes(key))?.[1] ?? "Browser";
  const os = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
    ([
      [/Android/, "Android"], [/iPhone|iPad/, "iOS"], [/CrOS/, "ChromeOS"], [/Mac OS X/, "macOS"],
      [/Windows/, "Windows"], [/Linux/, "Linux"],
    ] as const).find(([pattern]) => pattern.test(ua))?.[1];
  return os ? `${browser} on ${os}` : browser;
}

function takePairCode() {
  const params = new URLSearchParams(location.search);
  const raw = params.get("pair");
  if (raw === null) return null;
  params.delete("pair");
  const search = params.toString();
  history.replaceState(history.state, "", location.pathname + (search && `?${search}`) + location.hash);
  const code = raw.toUpperCase().replace(/[\s-]/g, "");
  return /^[A-Z]{8}$/.test(code) ? `${code.slice(0, 4)}-${code.slice(4)}` : null;
}

function sessionToken(c: Pick<Clerk, "session"> | undefined, forceRefreshToken: boolean) {
  const session = c?.session;
  if (!session) return Promise.resolve(null);
  const aud = session.lastActiveToken?.jwt?.claims.aud;
  const template =
    aud === "convex" || (Array.isArray(aud) && aud.includes("convex"))
      ? undefined
      : "convex";
  return session.getToken({ template, skipCache: forceRefreshToken }).catch(() => null);
}

async function startTracker() {
  const { mount, update } = await import("./app");
  let clerk: Clerk | undefined;
  const pendingSignIns = new WeakSet<HTMLDivElement>();
  const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL);

  const expectsSession =
    /(?:^|;\s*)__client_uat(?:_[^=]*)?=(?!0(?:;|$))[^;]/.test(document.cookie) ||
    /sso-callback|__clerk_|__dev_session/.test(
      location.pathname + location.search + location.hash,
    );
  let auth: Bridge["auth"] = {
    isLoading: expectsSession,
    isAuthenticated: false,
  };
  let runs: Bridge["runs"];
  let stopRuns: (() => void) | undefined;
  let avatar: Bridge["avatar"];
  let stopAvatar: (() => void) | undefined;
  let theme: Bridge["theme"];
  let stopTheme: (() => void) | undefined;
  let userId: string | null | undefined = expectsSession ? undefined : null;
  let pairCode = takePairCode();
  let labelAfterSignIn = false;

  const bridge = (): Bridge => ({
    track: (name, version) => { void convex.mutation(api.events.track, { name, version }).catch(() => {}); },
    auth,
    runs: auth.isAuthenticated ? runs : [],
    avatar: auth.isAuthenticated ? avatar : null,
    setAvatar: (n) => convex.mutation(api.runs.setAvatar, { avatar: n }),
    theme: auth.isAuthenticated ? theme : null,
    setTheme: (look, mode) =>
      convex.mutation(api.runs.setTheme, { look, mode: mode as "auto" }),
    getState: (id) => convex.query(api.runs.get, { id }),
    mountSignIn: (el) => {
      if (!clerk?.loaded) {
        pendingSignIns.add(el);
        el.textContent = "Sign-in is loading. You can keep playing as a guest.";
        void loadClerk().then(() => {
          if (!pendingSignIns.delete(el) || !el.isConnected || clerk?.user)
            return;
          if (clerk?.loaded) bridge().mountSignIn(el);
          else
            el.textContent =
              "Sign-in couldn't load. Reload to try again, or keep playing as a guest.";
        });
        return true;
      }
      el.textContent = "";
      clerk.mountSignIn(el, {
        routing: "hash",
        withSignUp: true,
        appearance: {
          variables: {
            colorPrimary: "var(--teal)",
            colorPrimaryForeground: "var(--bg)",
            colorBackground: "var(--surface)",
            colorForeground: "var(--ink)",
            colorMutedForeground: "var(--soft)",
            colorNeutral: "var(--ink)",
            colorBorder: "var(--line)",
            colorInput: "var(--bg)",
            colorInputForeground: "var(--ink)",
            fontFamily: "inherit",
            borderRadius: "12px",
          },
          elements: {
            rootBox: { width: "100%" },
            cardBox: {
              width: "100%",
              maxWidth: "none",
              boxShadow: "none",
              border: 0,
              borderRadius: 0,
            },
            card: {
              boxShadow: "none",
              border: 0,
              padding: 0,
              background: "transparent",
            },
            header: { display: "none" },
            footer: { background: "transparent" },
            dividerLine: { background: "var(--line)" },
          },
        },
      });
      return true;
    },
    unmountSignIn: (el) => {
      pendingSignIns.delete(el);
      clerk?.unmountSignIn(el);
      if (location.hash.startsWith("#/"))
        history.replaceState(null, "", location.pathname + location.search);
    },
    signOut: () => void clerk?.signOut(),
    createRun: (version) => convex.mutation(api.runs.create, { version }),
    importRun: async (version, caught, importId, startedAt) => {
      const session = clerk?.session, target = auth.userId;
      if (!session || !target || !auth.isAuthenticated) throw new Error("Sign in first");
      // Keep retries bound to the session that confirmed the import.
      const importer = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
      let timer: ReturnType<typeof setTimeout> | undefined;
      importer.setAuth(({ forceRefreshToken }) =>
        clerk?.user?.id === target && clerk.session?.id === session.id
          ? sessionToken({ session }, forceRefreshToken)
          : Promise.resolve(null));
      try {
        return await Promise.race([
          importer.mutation(api.runs.importCaught, { version, caught, importId, startedAt }),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("Import timed out")), 30000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
        await importer.close();
      }
    },
    saveRun: (id, state) => convex.mutation(api.runs.save, { id, state }),
    deleteRun: (id) => convex.mutation(api.runs.remove, { id }),
    setStart: (id, startedAt) =>
      convex.mutation(api.runs.setStart, { id, startedAt }),
    deleteAccount: async () => {
      await convex.mutation(api.runs.deleteAccount, {});
      await clerk?.user?.delete();
    },
    contact: (input) => convex.mutation(api.runs.contact, input),
    pairCode,
    clearPairCode: () => { pairCode = null; },
    startPairing: async (onState) => {
      const { id, code, secret, expiresAt } = await convex.mutation(api.pairing.start, { label: deviceLabel() });
      const release = () => { void convex.mutation(api.pairing.finish, { id, secret }).catch(() => {}); };
      let done = false;
      const stop = convex.onUpdate(api.pairing.status, { id, secret }, (s) => {
        if (done) return;
        if (s.status === "pending") return onState("pending");
        done = true;
        stop();
        if (s.status !== "approved") return onState(s.status);
        onState("approved");
        void (async () => {
          try {
            await loadClerk();
            if (!clerk?.client) throw new Error("Sign-in is unavailable");
            const attempt = await clerk.client.signIn.create({ strategy: "ticket", ticket: s.ticket });
            if (attempt.status !== "complete" || !attempt.createdSessionId)
              throw new Error(`Ticket sign-in stopped at ${attempt.status}`);
            labelAfterSignIn = true;
            await clerk.setActive({ session: attempt.createdSessionId });
            onState("signed-in");
          } catch (err) {
            labelAfterSignIn = false;
            console.warn("Device sign-in failed", err);
            onState("failed");
          } finally {
            release();
          }
        })();
      });
      return {
        code, expiresAt,
        url: `${location.origin}/?pair=${code}`,
        cancel: () => {
          if (done) return;
          done = true;
          stop();
          release();
        },
      };
    },
    lookupPairing: (code) => convex.mutation(api.pairing.lookup, { code }),
    approvePairing: (code) => convex.action(api.pairing.approve, { code }),
    denyPairing: (code) => convex.mutation(api.pairing.deny, { code }),
    listDevices: async () => {
      const user = clerk?.user;
      if (!user) return [];
      const [sessions, labels] = await Promise.all([
        user.getSessions(),
        convex.query(api.devices.labels, {}),
      ]);
      const named = new Map(labels.map((l) => [l.sid, l.label]));
      return sessions.map((s): Device => ({
        id: s.id,
        label: named.get(s.id) ??
          ([s.latestActivity?.browserName, s.latestActivity?.deviceType].filter(Boolean).join(" on ") || "Unknown device"),
        current: s.id === clerk?.session?.id,
        lastActiveAt: s.lastActiveAt.getTime(),
        city: s.latestActivity?.city,
      }));
    },
    revokeDevice: (sessionId) => convex.action(api.devices.revoke, { sessionId }),
  });
  const render = () => update(bridge());

  function onUser(user: Clerk["user"]) {
    const id = user?.id ?? null;
    if (id === userId) return;
    userId = id;
    stopRuns?.();
    stopRuns = runs = undefined;
    stopAvatar?.();
    stopAvatar = avatar = undefined;
    stopTheme?.();
    stopTheme = theme = undefined;
    auth = { isLoading: !!user, isAuthenticated: false };
    convex.setAuth(
      async ({ forceRefreshToken }) => user ? sessionToken(clerk, forceRefreshToken) : null,
      (ok) => {
        if (user && !ok) console.warn("Convex rejected the Clerk token");
        if (ok && labelAfterSignIn) {
          labelAfterSignIn = false;
          void convex.mutation(api.devices.label, { label: deviceLabel() }).catch(() => {});
        }
        auth = {
          isLoading: false,
          isAuthenticated: ok,
          userId: ok ? user?.id : undefined,
          displayName: user?.firstName || user?.fullName || undefined,
          email: user?.primaryEmailAddress?.emailAddress,
        };
        stopRuns?.();
        stopRuns = ok
          ? convex.onUpdate(api.runs.list, {}, (rows) => {
              runs = rows;
              render();
            })
          : undefined;
        stopAvatar?.();
        stopAvatar = ok
          ? convex.onUpdate(api.runs.avatar, {}, (n) => {
              avatar = n;
              render();
            })
          : undefined;
        stopTheme?.();
        stopTheme = ok
          ? convex.onUpdate(api.runs.theme, {}, (t) => {
              theme = t;
              render();
            })
          : undefined;
        render();
      },
    );
    render();
  }

  mount(document.getElementById("app")!, bridge());
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    const firstVisit = !navigator.serviceWorker.controller;
    void navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        // ponytail: files still downloading at this moment are missed; they get
        // stored on the next visit.
        if (firstVisit)
          reg.active?.postMessage(
            performance.getEntriesByType("resource").map((e) => e.name),
          );
      })
      .catch(() => {});
  }
  let clerkReady: Promise<void> | undefined;
  const downloadClerk = () => Promise.all([
    import("@clerk/clerk-js"),
    import("@clerk/ui"),
  ]);
  const loadClerk = () =>
    (clerkReady ??= (async () => {
      try {
        const [{ Clerk }, { ui }] = await downloadClerk();
        const c = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
        await c.load({ ui });
        clerk = c;
      } catch (err) {
        clerkReady = undefined;
        console.warn("Sign-in is unavailable; playing as a guest", err);
        onUser(null);
        return;
      }
      try {
        if (/sso-callback/.test(location.pathname + location.hash))
          await clerk!.handleRedirectCallback({}, async () =>
            history.replaceState(null, "", location.pathname + location.search),
          );
      } catch (err) {
        console.warn("Sign-in redirect failed", err);
      }
      clerk!.addListener(({ user }) => onUser(user));
    })());
  if (expectsSession || pairCode) {
    void loadClerk();
    // ponytail: fixed wait before falling back to guest play; a slow sign-in
    // that finishes later still signs the user in.
    setTimeout(() => userId === undefined && onUser(null), 10000);
  }

  let preloadTried = false;
  const appRoot = document.getElementById("app")!;
  for (const event of ["pointerover", "focusin", "touchstart"]) {
    appRoot.addEventListener(event, (e) => {
      if (preloadTried) return;
      if (e.target instanceof Element && e.target.closest("[data-signinsheet]")) {
        preloadTried = true;
        void loadClerk();
      }
    }, { passive: true });
  }
  const preloadDownload = () => { void downloadClerk().catch(() => {}); };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preloadDownload, { timeout: 5000 });
  } else {
    setTimeout(preloadDownload, 4000);
  }
}
