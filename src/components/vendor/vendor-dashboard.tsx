"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarClock,
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
import { AppointmentsTab } from "@/components/vendor/appointments-tab";
import { StatsTab } from "@/components/vendor/stats-tab";
import { OrdersTab } from "@/components/vendor/orders-tab";
import { ReviewsTab } from "@/components/vendor/reviews-tab";
import { SettingsTab } from "@/components/vendor/settings-tab";
import { CreateOfferDrawer } from "@/components/vendor/create-offer-drawer";
import { OfferFormModal } from "@/components/vendor/offer-form-modal";
import {
  initialVendorAppointments,
  initialVendorOffers,
  initialVendorReviews,
  type VendorAppointment,
  type VendorOffer,
  type VendorReview,
} from "@/components/vendor/vendor-data";
import { useT } from "@/lib/i18n";
import { useMember } from "@/lib/account";

/**
 * Espace pro — second niveau de la charte : fond blanc (annotation « mettre un
 * fond blanc »), accents bordeaux et titres en serif. Plus calme que le public.
 */
const tabs = [
  { key: "overview", label: "Tableau de bord", labelEn: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "planning", label: "Planning", labelEn: "Planning", icon: <CalendarDays className="h-4 w-4" /> },
  { key: "offers", label: "Mes offres", labelEn: "My offers", icon: <Ticket className="h-4 w-4" /> },
  { key: "appointments", label: "Rendez-vous", labelEn: "Appointments", icon: <CalendarClock className="h-4 w-4" /> },
  { key: "stats", label: "Statistiques", labelEn: "Statistics", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "orders", label: "Réservations", labelEn: "Bookings", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "reviews", label: "Avis", labelEn: "Reviews", icon: <Star className="h-4 w-4" /> },
  { key: "settings", label: "Paramètres", labelEn: "Settings", icon: <Settings className="h-4 w-4" /> },
] as const;

/**
 * Ce qu'un centre voit de l'espace pro : son planning, son catalogue, ses
 * réservations, ses statistiques et ses avis. Le planning est son propre
 * temps, il est donc le seul à pouvoir le poser, et « Mes offres » ne montre
 * que SES cours : c'est la même liste que le planning, vue en tableau avec le
 * prix live.
 *
 * « Rendez-vous » a été RETIRÉ de cette liste (27/08/2026) : poser un créneau
 * dans son agenda, c'est déjà ce que fait le planning, et deux entrées pour le
 * même geste obligeaient à deviner laquelle ouvrir.
 *
 * Restent au compte d'administration le tableau de bord d'ensemble, les
 * rendez-vous et les réglages de la plateforme, qui portent sur TOUS les
 * centres.
 */
const ONGLETS_CENTRE = ["planning", "offers", "stats", "orders", "reviews"] as const;

export function VendorDashboard() {
  const t = useT();
  const member = useMember();
  const estCentre = member?.role === "centre";
  /* Le compte d'un centre porte le nom du studio dans son prénom. */
  const nomAffiche = estCentre && member ? member.firstName : "Studio Bloom";
  const onglets = estCentre
    ? tabs.filter((o) => (ONGLETS_CENTRE as readonly string[]).includes(o.key))
    : tabs;

  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("overview");

  /*
    L'onglet affiché est DÉDUIT, pas corrigé après coup dans un effet : le rendu
    serveur est toujours déconnecté, l'onglet initial vaut donc « Tableau de
    bord », que le centre n'a pas. Sans cette déduction, il tomberait sur une
    page vide le temps de l'hydratation, et la règle du projet interdit de
    remettre l'état à jour depuis un effet.
  */
  const ongletActif =
    estCentre && !(ONGLETS_CENTRE as readonly string[]).includes(tab) ? "planning" : tab;
  const [offers, setOffers] = useState<VendorOffer[]>(initialVendorOffers);
  const [appointments, setAppointments] = useState<VendorAppointment[]>(initialVendorAppointments);
  const [reviews, setReviews] = useState<VendorReview[]>(initialVendorReviews);
  const [drawerOpen, setDrawerOpen] = useState(false);
  /** Offre en cours de modification (bouton « Modifier » de Mes offres). */
  const [editing, setEditing] = useState<VendorOffer | null>(null);

  const duplicate = (id: string) =>
    setOffers((prev) => {
      const src = prev.find((o) => o.id === id);
      if (!src) return prev;
      return [
        ...prev,
        { ...src, id: `${src.id}-copie-${prev.length}`, title: `${src.title} ${t("(copie)", "(copy)")}`, placesLeft: src.capacity, paused: false },
      ];
    });

  const addOffer = (offer: VendorOffer) => setOffers((prev) => [offer, ...prev]);

  /* La réponse d'un centre est écrite dans une seule langue : on la range telle
     quelle dans les deux champs plutôt que de la faire traduire par la machine. */
  const replyToReview = (id: string, text: string) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: text, replyEn: text } : r)));

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
            <p className="eyebrow text-pro-accent">{t("Espace pro, démo", "Pro area, demo")}</p>
            <h1 className="pro-display mt-1 text-3xl text-ink sm:text-4xl">
              {t(`Bonjour, ${nomAffiche}`, `Hello, ${nomAffiche}`)}
            </h1>
          </div>
          {/* Publier une offre relève de l'onglet Mes offres, désormais ouvert au
              centre comme à l'administration : le bouton l'est donc aussi. */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-pro-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
          >
            <Plus className="h-4 w-4" /> {t("Créer une offre", "Create an offer")}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
          {/* sidebar */}
          {/*
            Sous `lg`, les 7 onglets font 945 px pour un écran de 350 : en
            défilement horizontal, iOS n'affiche aucune barre et cinq onglets
            devenaient introuvables. Ils passent donc à la ligne — tout est
            visible d'un coup d'œil. La colonne verticale reprend à partir de `lg`.
          */}
          <aside className="flex flex-wrap gap-1 rounded-2xl bg-white p-2 ring-1 ring-line lg:h-fit lg:flex-col lg:flex-nowrap">
            {onglets.map((tab_) => (
              <button
                key={tab_.key}
                onClick={() => setTab(tab_.key)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-colors",
                  ongletActif === tab_.key
                    ? "bg-pro-accent text-white"
                    : "text-ink-soft hover:bg-pro-surface hover:text-ink",
                )}
              >
                {tab_.icon} {t(tab_.label, tab_.labelEn)}
              </button>
            ))}
          </aside>

          {/* content */}
          <div className="min-w-0">
            {ongletActif === "overview" && <OverviewTab offers={offers} />}
            {ongletActif === "planning" && <PlanningTab offers={offers} onPublish={addOffer} />}
            {ongletActif === "offers" && (
              <OffersTab
                offers={offers}
                onDuplicate={duplicate}
                onEdit={setEditing}
                onCreate={() => setDrawerOpen(true)}
              />
            )}
            {ongletActif === "appointments" && (
              <AppointmentsTab
                appointments={appointments}
                onAdd={(rdv) => setAppointments((prev) => [...prev, rdv])}
                onRemove={(id) => setAppointments((prev) => prev.filter((r) => r.id !== id))}
              />
            )}
            {ongletActif === "stats" && <StatsTab />}
            {ongletActif === "orders" && <OrdersTab />}
            {ongletActif === "reviews" && (
              <ReviewsTab reviews={reviews} offers={offers} onReply={replyToReview} />
            )}
            {ongletActif === "settings" && <SettingsTab />}
          </div>
        </div>

        <CreateOfferDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreate={createOffer} />

        {editing && (
          <OfferFormModal
            mode="edit"
            day={editing.day}
            initial={editing}
            onClose={() => setEditing(null)}
            onSubmit={(updated) => {
              setOffers((prev) => prev.map((o) => (o.id === editing.id ? { ...o, ...updated } : o)));
              setEditing(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
