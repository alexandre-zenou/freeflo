"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  ClipboardList,
  Settings,
  Plus,
  Check,
  Clock,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewTab } from "@/components/vendor/overview-tab";
import { OffersTab } from "@/components/vendor/offers-tab";
import { StatsTab } from "@/components/vendor/stats-tab";
import { CreateOfferDrawer } from "@/components/vendor/create-offer-drawer";
import {
  initialVendorOffers,
  vendorOrders,
  type VendorOffer,
} from "@/components/vendor/vendor-data";

const tabs = [
  { key: "overview", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "offers", label: "Mes offres", icon: <Ticket className="h-4 w-4" /> },
  { key: "stats", label: "Statistiques", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "orders", label: "Commandes", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "settings", label: "Paramètres", icon: <Settings className="h-4 w-4" /> },
] as const;

export function VendorDashboard() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("overview");
  const [offers, setOffers] = useState<VendorOffer[]>(initialVendorOffers);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const togglePause = (id: string) =>
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, paused: !o.paused } : o)));

  const duplicate = (id: string) =>
    setOffers((prev) => {
      const src = prev.find((o) => o.id === id);
      if (!src) return prev;
      return [
        ...prev,
        { ...src, id: `${src.id}-copie-${prev.length}`, title: `${src.title} (copie)`, placesLeft: src.capacity, paused: false },
      ];
    });

  const createOffer = (offer: VendorOffer) => {
    setOffers((prev) => [offer, ...prev]);
    setDrawerOpen(false);
    setTab("offers");
  };

  return (
    <div className="ff-container py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-peri-deep">Espace pro · démo</p>
          <h1 className="display text-3xl text-ink sm:text-4xl">Bonjour, Studio Bloom</h1>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3 text-sm font-medium text-white ember-glow transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> Créer une offre
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* sidebar */}
        <aside className="flex gap-1 overflow-x-auto rounded-2xl bg-paper p-2 ring-1 ring-line lg:h-fit lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-colors",
                tab === t.key ? "bg-ink text-bone" : "text-ink-soft hover:bg-secondary",
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </aside>

        {/* content */}
        <div className="min-w-0">
          {tab === "overview" && <OverviewTab offers={offers} onGoToOffers={() => setTab("offers")} />}

          {tab === "offers" && (
            <OffersTab
              offers={offers}
              onTogglePause={togglePause}
              onDuplicate={duplicate}
              onCreate={() => setDrawerOpen(true)}
            />
          )}

          {tab === "stats" && <StatsTab />}

          {tab === "orders" && (
            <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
              {vendorOrders.map((o) => (
                <div key={o.ref} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                  <span className={cn("grid h-9 w-9 place-items-center rounded-full", o.state === "à préparer" ? "bg-ember/12 text-ember-deep" : "bg-peri-tint text-peri-deep")}>
                    {o.state === "à préparer" ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{o.name}</p>
                    <p className="truncate text-sm text-ink-soft">{o.offer}</p>
                  </div>
                  <span className="hidden font-mono text-xs text-ink-soft sm:block">{o.ref}</span>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", o.state === "à préparer" ? "bg-ember/12 text-ember-deep" : "bg-secondary text-ink-soft")}>
                    {o.state}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "settings" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { t: "Informations du centre", d: "Nom, adresse, catégories, photos." },
                { t: "Coordonnées bancaires", d: "IBAN vérifié · virements quotidiens actifs." },
                { t: "Informations légales", d: "SIRET validé · CGU pros signées." },
                { t: "Boutons réseaux sociaux", d: "Intégrez la réservation sur Instagram (V2)." },
              ].map((s) => (
                <div key={s.t} className="rounded-2xl bg-paper p-6 ring-1 ring-line">
                  <h3 className="font-medium text-ink">{s.t}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateOfferDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreate={createOffer} />
    </div>
  );
}
