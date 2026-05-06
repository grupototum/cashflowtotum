import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { HudLabel } from "@/components/hud-label";
import { BrutalCard } from "@/components/brutal-card";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({ meta: [{ title: "Perfil — CashFlow" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name ?? "");
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user!.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const changePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Senha precisa ter pelo menos 6 caracteres");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Senha alterada");
    setPassword("");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <HudLabel>USUÁRIO</HudLabel>
        <h1 className="font-display text-3xl md:text-5xl uppercase mt-1">Perfil</h1>
      </div>

      <BrutalCard className="p-5">
        <HudLabel>IDENTIFICAÇÃO</HudLabel>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
          <div>
            <div className="hud-label">EMAIL</div>
            <div className="mt-1 text-foreground">{user?.email}</div>
          </div>
          <div>
            <div className="hud-label">USER ID</div>
            <div className="mt-1 text-foreground truncate text-xs">{user?.id}</div>
          </div>
        </div>
      </BrutalCard>

      <BrutalCard className="p-5">
        <form onSubmit={saveProfile} className="space-y-3">
          <HudLabel>NOME DE EXIBIÇÃO</HudLabel>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={saving} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-wider font-medium">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </BrutalCard>

      <BrutalCard className="p-5">
        <form onSubmit={changePass} className="space-y-3">
          <HudLabel>NOVA SENHA</HudLabel>
          <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={saving || password.length < 6} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-wider font-medium disabled:opacity-50">
            Atualizar senha
          </button>
        </form>
      </BrutalCard>

      <BrutalCard className="p-5 border-[color:var(--flare)]/40">
        <HudLabel>ZONA DE PERIGO</HudLabel>
        <button onClick={logout} className="mt-3 inline-flex items-center gap-2 bg-[color:var(--flare)] text-white px-4 py-2 text-xs uppercase tracking-wider font-medium">
          <LogOut className="size-3.5" /> Encerrar sessão
        </button>
      </BrutalCard>
    </div>
  );
}
