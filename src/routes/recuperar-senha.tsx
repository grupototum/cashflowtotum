import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HudLabel } from "@/components/hud-label";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [{ title: "Recuperar senha — CashFlow" }],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [recovery, setRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setRecovery(true);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-senha`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Enviamos um link de redefinição para seu e-mail.");
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Senha atualizada. Faça login.");
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-border bg-[var(--surface)] p-8 space-y-6">
        <HudLabel>{recovery ? "REDEFINIR" : "RECUPERAR"}</HudLabel>
        <h1 className="font-display text-3xl uppercase">
          {recovery ? "Nova senha" : "Recuperar senha"}
        </h1>
        {recovery ? (
          <form onSubmit={updatePassword} className="space-y-4">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button disabled={loading} className="w-full bg-primary text-primary-foreground py-3 uppercase tracking-wider text-sm">
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        ) : (
          <form onSubmit={requestReset} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button disabled={loading} className="w-full bg-primary text-primary-foreground py-3 uppercase tracking-wider text-sm">
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary uppercase font-mono">
          ← Voltar
        </Link>
      </div>
    </div>
  );
}
