import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Lock } from "lucide-react";
import { adminCreatePassword, adminLogin } from "@/lib/admin-gate.functions";

export function AdminLogin({ onUnlocked, setupRequired = false }: { onUnlocked: () => void; setupRequired?: boolean }) {
  const login = useServerFn(adminLogin);
  const createPassword = useServerFn(adminCreatePassword);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = setupRequired
        ? await createPassword({ data: { password, confirmPassword } })
        : await login({ data: { password } });
      if (res.ok) onUnlocked();
      else setError("error" in res && res.error ? res.error : "Incorrect password");
    } catch {
      setError("Incorrect password");
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
          <h1 className="text-lg font-extrabold">{setupRequired ? "Create Admin Password" : "Admin Login"}</h1>
        </div>
        <input
          type="password"
          autoComplete={setupRequired ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={setupRequired ? "New password" : "Enter admin password"}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        {setupRequired ? (
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        ) : null}
        {error ? <p className="text-xs font-medium text-destructive">{error === "error" ? "Incorrect password" : error}</p> : null}
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
