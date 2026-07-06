"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  ClipboardList,
  Settings,
  Plus,
  TrendingUp,
  Wallet,
  Star,
  Copy,
  Pencil,
  Check,
  Clock,
} from "lucide-react";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";

const kpis = [
  { icon: <Ticket className="h-4 w-4" />, label: "Paniers vendus (mois)", value: "148", delta: "+22%" },
  { icon: <TrendingUp className="h-4 w-4" />, label: "CA généré (mois)", value: "3 240 €", delta: "+18%" },
  { icon: <Wallet className="h-4 w-4" />, label: "Virement de demain", value: "126 €", delta: "quotidien" },
  { icon: <Star className="h-4 w-4" />, label: "Note moyenne", value: "4,9", delta: "512 avis" },
];

const chart = [40, 55, 48, 70, 62, 88, 96];
const days = ["L", "M", "M", "J", "V", "S", "D"];

const todayOffers = [
  { title: "Vinyasa Flow — 18h30", cat: "Yoga", stock: "6 / 12", price: 13.2, base: 24, status: "live" },
  { title: "Pilates doux — 12h00", cat: "Pilates", stock: "0 / 8", price: 0, base: 22, status: "sold" },
  { title: "Yoga débutant — 20h00", cat: "Yoga", stock: "9 / 10", price: 24, base: 24, status: "full" },
];

const orders = [
  { name: "Thomas L.", offer: "Vinyasa Flow — 18h30", ref: "FLO-STU-193", state: "à préparer" },
  { name: "Amélie R.", offer: "Vinyasa Flow — 18h30", ref: "FLO-STU-194", state: "à préparer" },
  { name: "Karim B.", offer: "Pilates doux — 12h00", ref: "FLO-STU-188", state: "retiré" },
  { name: "Julie M.", offer: "Pilates doux — 12h00", ref: "FLO-STU-187", state: "retiré" },
];

const tabs = [
  { key: "overview", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "offers", label: "Mes offres", icon: <Ticket className="h-4 w-4" /> },
  { key: "orders", label: "Commandes", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "settings", label: "Paramètres", icon: <Settings className="h-4 w-4" /> },
] as const;

export function VendorDashboard() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("overview");

  return (
    <div className="ff-container py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-peri-deep">Espace pro · démo</p>
          <h1 className="display text-3xl text-ink sm:text-4xl">Bonjour, Studio Bloom</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3 text-sm font-medium text-white ember-glow transition-colors hover:bg-ember-deep">
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
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((k) => (
                  <div key={k.label} className="rounded-2xl bg-paper p-5 ring-1 ring-line">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-peri-tint text-peri-deep">{k.icon}</span>
                    <p className="mt-4 font-display text-3xl font-medium text-ink">{k.value}</p>
                    <p className="mt-1 flex items-center justify-between text-xs text-ink-soft">
                      {k.label} <span className="text-peri-deep">{k.delta}</span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl bg-paper p-6 ring-1 ring-line">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-ink">Revenus des 7 derniers jours</h3>
                    <span className="text-sm text-peri-deep">+18%</span>
                  </div>
                  <div className="mt-6 flex h-40 items-end gap-3">
                    {chart.map((v, i) => (
                      <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <div
                          className="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-peri-deep to-peri"
                          style={{ height: `${v}%` }}
                        />
                        <span className="text-xs text-ink-soft">{days[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-ink p-6 text-bone">
                  <h3 className="font-medium">Prochain virement</h3>
                  <p className="mt-4 font-display text-4xl font-medium">{formatEuro(126)}</p>
                  <p className="mt-1 text-sm text-white/60">Demain · virement quotidien automatique</p>
                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                    <p className="flex justify-between"><span className="text-white/60">Ventes du jour</span><span>168 €</span></p>
                    <p className="flex justify-between"><span className="text-white/60">Commission FREEFLO</span><span>− 42 €</span></p>
                    <p className="flex justify-between font-medium"><span>Net à recevoir</span><span className="text-ember">126 €</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "offers" && (
            <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft sm:grid">
                <span>Offre du jour</span><span>Places</span><span>Prix live</span><span className="text-right">Actions</span>
              </div>
              {todayOffers.map((o) => (
                <div key={o.title} className="grid grid-cols-2 items-center gap-4 border-b border-line px-5 py-4 last:border-0 sm:grid-cols-[2fr_1fr_1fr_1fr]">
                  <span className="font-medium text-ink">
                    {o.title}
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-ink-soft">{o.cat}</span>
                  </span>
                  <span className="text-sm text-ink-soft">{o.stock}</span>
                  <span className="text-sm">
                    {o.status === "sold" ? (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink-soft">Épuisé</span>
                    ) : o.status === "full" ? (
                      <span className="tabular-nums text-ink">{formatEuro(o.price)} · plein tarif</span>
                    ) : (
                      <span className="tabular-nums font-medium text-ember-deep">{formatEuro(o.price)} <span className="text-ink-soft line-through">{formatEuro(o.base)}</span></span>
                    )}
                  </span>
                  <div className="col-span-2 flex justify-end gap-2 sm:col-span-1">
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-ink-soft hover:text-ink" aria-label="Dupliquer"><Copy className="h-4 w-4" /></button>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-ink-soft hover:text-ink" aria-label="Modifier"><Pencil className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              <div className="p-5">
                <button className="inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2.5 text-sm text-ink-soft hover:border-ink hover:text-ink">
                  <Plus className="h-4 w-4" /> Dupliquer les offres d&apos;hier
                </button>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
              {orders.map((o) => (
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
    </div>
  );
}
