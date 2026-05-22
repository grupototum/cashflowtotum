import { useEffect, useRef, useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

export function ExportMenu({
  onCSV,
  onPDF,
  disabled,
  label = "Exportar",
}: {
  onCSV: () => void;
  onPDF: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 border border-border text-foreground px-3 py-2.5 text-xs uppercase tracking-wider font-medium hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
      >
        <Download className="size-4" /> <span className="hidden sm:inline">{label}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-30 w-48 border border-border bg-[var(--surface)] shadow-lg">
          <button
            onClick={() => {
              setOpen(false);
              onCSV();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs uppercase font-mono tracking-wider hover:bg-[var(--surface-elevated)]"
          >
            <FileSpreadsheet className="size-3.5 text-primary" /> CSV
            <span className="ml-auto text-muted-foreground normal-case">Excel</span>
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onPDF();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs uppercase font-mono tracking-wider hover:bg-[var(--surface-elevated)] border-t border-border"
          >
            <FileText className="size-3.5 text-primary" /> PDF
            <span className="ml-auto text-muted-foreground normal-case">A4</span>
          </button>
        </div>
      )}
    </div>
  );
}
