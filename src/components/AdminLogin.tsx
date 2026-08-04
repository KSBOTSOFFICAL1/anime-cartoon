import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Lock } from "lucide-react";
import { adminLogin } from "@/lib/admin-gate.functions";

export function AdminLogin({ onUnlocked }: { onUnlocked: () => void }) {
  const login = useServerFn(adminLogin);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const res = await login({ data: { password } });
      if (res.ok) onUnlocked();
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 text-foreground">
          <Lock className="h-4 w-4 text-primary" />
          <h1 className="text-lg font-extrabold">Admin Login</h1>
        </div>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        {error ? <p className="text-xs font-medium text-destructive">Incorrect password</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Checking..." : "Login"}
        </button>
      </form>
    </div>
  );
}
