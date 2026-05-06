import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useMemo, useState } from "react";
import { HudLabel } from "@/components/hud-label";
import { BrutalCard } from "@/components/brutal-card";
import { brl } from "@/lib/format";
import { Plus, Trash2, X, Pencil, Wallet, CreditCard, PiggyBank, Banknote } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/contas")({
  head: () => ({ meta: [{ title: "Contas — CashFlow" }] }),
  component: AccountsPage,
});

type Account = { id: string; name: string; type: string; color: string; initial_balance: number };
type Tx = { account_id: string | null; amount: number; type: "income" | "expense" };

const TYPES = [
  { value: "checking", label: "Conta corrente", icon: Banknote },
  { value: "savings", label: "Poupança", icon: PiggyBank },
  { value: "credit_card", label: "Cartão de crédito", icon: CreditCard },
  { value: "wallet", label: "Carteira", icon: Wallet },
];

function AccountsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Account[];
    },
  });

  const { data: txs = [] } = useQuery({
    queryKey: ["transactions-for-balances", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("account_id,amount,type");
      if (error) throw error;
      return (data ?? []) as Tx[];
    },
  });

  const balances = useMemo(() => {
    const map = new Map<string, number>();
    accounts.forEach((a) => map.set(a.id, Number(a.initial_balance)));
    txs.forEach((t) => {
      if (!t.account_id) return;
      const cur = map.get(t.account_id) ?? 0;
      map.set(t.account_id, cur + (t.type === "income" ? Number(t.amount) : -Number(t.amount)));
    });
    return map;
  }, [accounts, txs]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta removida");
    },
  });

  const total = Array.from(balances.values()).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <HudLabel>CONTAS · CARTÕES</HudLabel>
          <h1 className="font-display text-3xl md:text-5xl uppercase mt-1">Contas</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-xs uppercase tracking-wider font-medium"
        >
          <Plus className="size-4" /> Nova
        </button>
      </div>

      <BrutalCard className="p-5 flex items-center justify-between">
        <HudLabel>SALDO CONSOLIDADO</HudLabel>
        <div className={`font-display text-3xl tabular-nums ${total >= 0 ? "text-primary" : "text-[color:var(--flare)]"}`}>
          {brl(total)}
        </div>
      </BrutalCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((a) => {
          const Type = TYPES.find((t) => t.value === a.type) ?? TYPES[0];
          const Icon = Type.icon;
          const balance = balances.get(a.id) ?? 0;
          return (
            <BrutalCard key={a.id} className="p-5 group relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 border border-border flex items-center justify-center" style={{ background: `${a.color}25` }}>
                    <Icon className="size-5" style={{ color: a.color }} />
                  </div>
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="hud-label">{Type.label}</div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="size-3.5" /></button>
                  <button onClick={() => confirm("Remover conta?") && del.mutate(a.id)} className="hover:text-[color:var(--flare)]">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <HudLabel bracket={false}>SALDO</HudLabel>
                <div className={`font-display text-2xl mt-1 tabular-nums ${balance >= 0 ? "text-foreground" : "text-[color:var(--flare)]"}`}>
                  {brl(balance)}
                </div>
              </div>
            </BrutalCard>
          );
        })}
      </div>

      {open && user && (
        <AccountModal
          acc={editing}
          userId={user.id}
          onClose={() => setOpen(false)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["accounts"] });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function AccountModal({ acc, userId, onClose, onSaved }: { acc: Account | null; userId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(acc?.name ?? "");
  const [type, setType] = useState(acc?.type ?? "checking");
  const [color, setColor] = useState(acc?.color ?? "#D1FF00");
  const [initial, setInitial] = useState(acc ? String(acc.initial_balance) : "0");
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { user_id: userId, name, type, color, initial_balance: Number(initial) };
    const res = acc
      ? await supabase.from("accounts").update(payload).eq("id", acc.id)
      : await supabase.from("accounts").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Conta salva");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <form onSubmit={save} className="relative w-full max-w-md border border-border bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl uppercase">{acc ? "Editar" : "Nova"} conta</h2>
          <button type="button" onClick={onClose}><X className="size-5" /></button>
        </div>
        <label className="block">
          <span className="hud-label block mb-1.5">Nome</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label className="block">
          <span className="hud-label block mb-1.5">Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-[var(--surface)] border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="hud-label block mb-1.5">Saldo inicial (R$)</span>
          <input type="number" step="0.01" value={initial} onChange={(e) => setInitial(e.target.value)} className="w-full bg-transparent border border-border px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <div>
          <span className="hud-label block mb-1.5">Cor</span>
          <div className="flex gap-2 flex-wrap">
            {["#D1FF00","#0099FF","#ED4609","#9C9C9C","#F4F4E8","#22C55E"].map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`size-8 border-2 ${color === c ? "border-primary" : "border-border"}`} style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-border py-2.5 text-xs uppercase tracking-wider">Cancelar</button>
          <button disabled={saving} className="flex-1 bg-primary text-primary-foreground py-2.5 text-xs uppercase tracking-wider font-medium">
            {saving ? "..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
