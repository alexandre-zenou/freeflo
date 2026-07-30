"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  ClipboardList,
  Settings,
  Plus,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewTab } from "@/components/vendor/overview-tab";
import { PlanningTab } from "@/components/vendor/planning-tab";
import { OffersTab } from "@/components/vendor/offers-tab";
import { StatsTab } from "@/components/vendor/stats-tab";
import { OrdersTab } from "@/components/vendor/orders-tab";
import { ReviewsTab } from "@/components/vendor/reviews-tab";
import { SettingsTab } from "@/components/vendor/settings-tab";
import { CreateOfferDrawer } from "@/components/vendor/create-offer-drawer";
import { initialVendorOffers, type VendorOffer } from "@/components/vendor/vendor-data";

/**
 * Espace pro — second niveau de la charte : fond blanc (annotation « mettre un
 * fond blanc »), accents bordeaux et titres en serif. Plus calme que le public.
 */
const tabs = [
  { key: "overview", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "planning", label: "Planning", icon: <CalendarDays className="h-4 w-4" /> },
  { key: "offers", label: "Mes offres", icon: <Ticket className="h-4 w-4" /> },
  { key: "stats", label: "Statistiques", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "orders", label: "Commandes", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "reviews", label: "Avis", icon: <Star className="h-4 w-4" /> },
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

  const addOffer = (offer: VendorOffer) => setOffers((prev) => [offer, ...prev]);

  const createOffer = (offer: VendorOffer) => {
    addOffer(offer);
    setDrawerOpen(false);
    setTab("offers");
  };

  return (
    <div className="min-h-dvh bg-white">
      <div className="ff-container py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-pro-accent">Espace pro · démo</p>
            <h1 className="serif-display mt-1 text-3xl text-ink sm:text-4xl">Bonjour, Studio Bloom</h1>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-pro-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
          >
            <Plus className="h-4 w-4" /> Créer une offre
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
          {/* sidebar */}
          <aside className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-2 ring-1 ring-line lg:h-fit lg:flex-col">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-colors",
                  tab === t.key
                    ? "bg-pro-accent text-white"
                    : "text-ink-soft hover:bg-pro-surface hover:text-ink",
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </aside>

          {/* content */}
          <div className="min-w-0">
            {tab === "overview" && <OverviewTab offers={offers} onGoToOffers={() => setTab("offers")} />}
            {tab === "planning" && <PlanningTab offers={offers} onPublish={addOffer} />}
            {tab === "offers" && (
              <OffersTab
                offers={offers}
                onTogglePause={togglePause}
                onDuplicate={duplicate}
                onCreate={() => setDrawerOpen(true)}
              />
            )}
            {tab === "stats" && <StatsTab />}
            {tab === "orders" && <OrdersTab />}
            {tab === "reviews" && <ReviewsTab />}
            {tab === "settings" && <SettingsTab />}
          </div>
        </div>

        <CreateOfferDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreate={createOffer} />
      </div>
    </div>
  );
}
