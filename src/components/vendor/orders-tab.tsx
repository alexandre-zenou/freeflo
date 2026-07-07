"use client";

import { useEffect, useState } from "react";
import { Check, Clock, QrCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { vendorOrders, type VendorOrder } from "@/components/vendor/vendor-data";

/** Scanner mock : cadre qui pulse ~1,5 s, « détecte » le billet, puis validation. */
function ScannerModal({
  order,
  onValidate,
  onClose,
}: {
  order: VendorOrder | null;
  onValidate: () => void;
  onClose: () => void;
}) {
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDetected(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-sm rounded-3xl bg-bone p-6 shadow-lift">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow text-peri-deep">Accueil</p>
            <h2 className="display mt-1 text-xl text-ink">Scanner un QR</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le scanner"
            className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-ink-soft transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!detected || !order ? (
          <div className="mt-5 grid aspect-square place-items-center rounded-2xl bg-ink">
            <div className="relative h-40 w-40">
              <div className="absolute inset-0 rounded-xl border-2 border-peri/60" />
              <div className="absolute inset-x-2 top-1/2 h-px animate-pulse bg-ember" />
              <QrCode className="absolute inset-0 m-auto h-16 w-16 text-white/25" />
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-paper p-5 ring-1 ring-line">
            <p className="flex items-center gap-2 text-sm font-medium text-peri-deep">
              <Check className="h-4 w-4" /> Billet reconnu
            </p>
            <p className="mt-3 font-medium text-ink">{order.name}</p>
            <p className="text-sm text-ink-soft">{order.offer}</p>
            <p className="mt-1 font-mono text-xs text-ink-soft">{order.ref}</p>
            <button
              onClick={onValidate}
              className="mt-5 w-full rounded-full bg-ember px-5 py-3 text-sm font-medium text-white ember-glow transition-colors hover:bg-ember-deep"
            >
              Valider l&apos;entrée
            </button>
          </div>
        )}
        <p className="mt-4 text-center text-xs text-ink-soft">
          Le client montre son QR — aucune appli à installer, ni pour lui, ni pour vous.
        </p>
      </div>
    </div>
  );
}

export function OrdersTab() {
  const [orders, setOrders] = useState<VendorOrder[]>(vendorOrders);
  const [scanning, setScanning] = useState(false);

  const nextToCheck = orders.find((o) => o.state === "à préparer") ?? null;

  const checkIn = (ref: string) =>
    setOrders((prev) => prev.map((o) => (o.ref === ref ? { ...o, state: "retiré" as const } : o)));

  const groups = orders.reduce<Record<string, VendorOrder[]>>((acc, o) => {
    return { ...acc, [o.offer]: [...(acc[o.offer] ?? []), o] };
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {orders.filter((o) => o.state === "à préparer").length} arrivées attendues aujourd&apos;hui
        </p>
        <button
          onClick={() => setScanning(true)}
          disabled={!nextToCheck}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:bg-ink/85 disabled:opacity-40"
        >
          <QrCode className="h-4 w-4" /> Scanner un QR
        </button>
      </div>

      {Object.entries(groups).map(([offer, list]) => {
        const arrived = list.filter((o) => o.state === "retiré").length;
        return (
          <div key={offer} className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
            <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
              <h3 className="text-sm font-medium text-ink">{offer}</h3>
              <span className="tabular-nums text-xs text-ink-soft">
                {arrived}/{list.length} arrivés
              </span>
            </div>
            {list.map((o) => (
              <div key={o.ref} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full",
                    o.state === "à préparer" ? "bg-ember/12 text-ember-deep" : "bg-peri-tint text-peri-deep",
                  )}
                >
                  {o.state === "à préparer" ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{o.name}</p>
                  <p className="truncate font-mono text-xs text-ink-soft">{o.ref}</p>
                </div>
                {o.state === "à préparer" ? (
                  <button
                    onClick={() => checkIn(o.ref)}
                    className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink"
                  >
                    Valider l&apos;entrée
                  </button>
                ) : (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-ink-soft">retiré</span>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {scanning && (
        <ScannerModal
          order={nextToCheck}
          onClose={() => setScanning(false)}
          onValidate={() => {
            if (nextToCheck) checkIn(nextToCheck.ref);
            setScanning(false);
          }}
        />
      )}
    </div>
  );
}
