import {
  signInWithGoogle,
  signOut,
  useAuth,
  useMutation,
  useQuery,
} from "lakebed/client";
import { useEffect, useRef } from "preact/hooks";

import { mount, update, type Bridge } from "./app";

type RunRow = Bridge["runs"] extends (infer T)[] | undefined ? T : never;

export function App() {
  const el = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const auth = useAuth();
  const runs = useQuery<RunRow[]>("myRuns");
  const createRun = useMutation<[string], string>("createRun");
  const saveRun = useMutation<[string, string], unknown>("saveRun");
  const deleteRun = useMutation<[string], unknown>("deleteRun");
  const deleteAccount = useMutation<[], unknown>("deleteAccount");
  const contact = useMutation<[{ email: string; message: string }], { ok: boolean }>("contact");

  const bridge: Bridge = {
    auth: {
      isLoading: auth.isLoading,
      isAuthenticated: !!auth.isAuthenticated,
      displayName: auth.identity?.displayName,
      provider: auth.identity?.provider ?? null,
    },
    runs: auth.isAuthenticated ? runs : [],
    signIn: () => void signInWithGoogle(),
    signOut: () => void signOut(),
    createRun,
    saveRun,
    deleteRun,
    deleteAccount,
    contact,
  };

  useEffect(() => {
    if (!el.current) return;
    if (!mounted.current) {
      mounted.current = true;
      mount(el.current, bridge);
    } else update(bridge);
  });

  return <div ref={el} />;
}
