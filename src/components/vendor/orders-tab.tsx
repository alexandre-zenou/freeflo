"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { vendorOrders, type VendorOrder } from "@/components/vendor/vendor-data";

const STATE_STYLE: Record<VendorOrder["state"], string> = {
  confirmée: "bg-emerald-50 text-emerald-700",
  arrivée: "bg-pro-surface text-pro-accent",
  annulée: "bg-brand-tint text-brand",
};

/**
 * Commandes — tableau de la maquette (client · cours · créneau · statut).
 * Le QR code a été retiré : à l'accueil, le centre confirme l'identité du client.
 */
export function OrdersTab() {
  const [orders, setOrders] = useState<VendorOrder[]>(vendorOrders);

  const confirmIdentity = (ref: string) =>
    setOrders((prev) =>
      prev.map((o) => (o.ref === ref ? { ...o, state: "arrivée" as const } : o)),
    );

  const expected = orders.filter((o) => o.state === "confirmée").length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        {expected} {expected > 1 ? "arrivées attendues" : "arrivée attendue"} · confirmez
        l&apos;identité du client à l&apos;accueil.
      </p>

      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-line">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Cours</th>
              <th className="px-5 py-3 font-medium">Créneau</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 text-right font-medium">Accueil</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.ref} className="border-b border-line last:border-0">
                <td className="px-5 py-4 font-medium text-ink">{o.name}</td>
                <td className="px-5 py-4 text-ink-soft">{o.offer}</td>
                <td className="px-5 py-4 tabular-nums text-ink-soft">{o.slot}</td>
                <td className="px-5 py-4">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATE_STYLE[o.state])}>
                    {o.state.charAt(0).toUpperCase() + o.state.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {o.state === "confirmée" ? (
                    <button
                      onClick={() => confirmIdentity(o.ref)}
                      className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-pro-accent hover:text-pro-accent"
                    >
                      Confirmer l&apos;identité
                    </button>
                  ) : (
                    <span className="text-xs text-ink-soft">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
