"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Lock, Check, MapPin, Clock, ShieldCheck } from "lucide-react";
import type { Offer } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { formatEuro, slotLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";

type Step = "recap" | "pay" | "done";

export function BookingFlow({
  offer,
  price,
  open,
  onClose,
}: {
  offer: Offer;
  price: number;
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [step, setStep] = useState<Step>("recap");
  const [processing, setProcessing] = useState(false);
  const ref = `FLO-${offer.id.slice(0, 3).toUpperCase()}-${String(offer.basePrice * 7 + offer.placesLeft)}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pay = () => {
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setStep("done");
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-lift sm:rounded-3xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary text-ink-soft hover:text-ink"
          aria-label={t("Fermer", "Close")}
        >
          <X className="h-4 w-4" />
        </button>

        {/* progress */}
        <div className="mb-6 flex items-center gap-2">
          {(["recap", "pay", "done"] as Step[]).map((s, i) => (
            <span
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full",
                ["recap", "pay", "done"].indexOf(step) >= i ? "bg-brand" : "bg-line",
              )}
            />
          ))}
        </div>

        {step === "recap" && (
          <div>
            <p className="eyebrow text-brand">{t("Réservation", "Booking")}</p>
            <h2 className="mt-2 font-display text-2xl text-ink">{t(offer.title, offer.titleEn)}</h2>
            <p className="mt-1 text-sm text-ink-soft">{offer.gym}, {offer.arrondissement}</p>

            <div className="mt-5 space-y-3 rounded-2xl bg-paper p-4 ring-1 ring-line">
              <Row icon={<Clock className="h-4 w-4" />} label={t("Créneau", "Time slot")} value={`${slotLabel(offer.startsInHours, locale)}, ${offer.durationMin} min`} />
              <Row icon={<MapPin className="h-4 w-4" />} label={t("Adresse", "Address")} value={offer.address} />
              <Row icon={<ShieldCheck className="h-4 w-4" />} label={t("Annulation", "Cancellation")} value={t("Gratuite jusqu'à 6 h avant", "Free up to 6 h before")} />
            </div>

            <div className="mt-5 flex items-end justify-between">
              <span className="text-sm text-ink-soft">{t("Prix bloqué à l'instant", "Price locked in now")}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-medium text-brand-deep">{formatEuro(price)}</span>
                {price < offer.basePrice && (
                  <span className="text-sm text-ink-soft line-through">{formatEuro(offer.basePrice)}</span>
                )}
              </div>
            </div>

            <Button variant="gold" size="lg" className="mt-5 w-full" onClick={() => setStep("pay")}>
              {t("Réserver à", "Book at")} {formatEuro(price)}
            </Button>
            <p className="mt-3 text-center text-xs text-ink-soft">
              {t("Place garantie dès le paiement confirmé. Aucune adhésion.", "Spot guaranteed once payment clears. No membership.")}
            </p>
          </div>
        )}

        {step === "pay" && (
          <div>
            <p className="eyebrow text-brand">{t("Paiement sécurisé", "Secure payment")}</p>
            <h2 className="mt-2 font-display text-2xl text-ink">{formatEuro(price)} {t("à régler", "to pay")}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
              <Lock className="h-3 w-3" /> {t("Démo : paiement sécurisé en production. N'entrez pas de vraie carte.", "Demo: secure payment in production. Do not enter a real card.")}
            </p>

            <div className="mt-5 space-y-3">
              <Field label={t("Nom sur la carte", "Name on card")} placeholder="Thomas Client" />
              <Field label={t("Numéro de carte", "Card number")} placeholder="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("Expiration", "Expiry")} placeholder="12 / 28" />
                <Field label="CVC" placeholder="123" />
              </div>
            </div>

            <Button variant="solid" size="lg" className="mt-6 w-full" onClick={pay} disabled={processing}>
              {processing ? t("Traitement…", "Processing…") : `${t("Payer", "Pay")} ${formatEuro(price)}`}
            </Button>
            <button onClick={() => setStep("recap")} className="mt-3 w-full text-center text-sm text-ink-soft hover:text-ink">
              {t("Retour", "Back")}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-tint text-brand">
              <Check className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-2xl text-ink">{t("C'est réservé !", "You're booked!")}</h2>

            {/* carte de confirmation de la maquette : fond rouge profond, total, or */}
            <div className="mt-6 rounded-3xl bg-brand-deep p-6 text-left text-white">
              <h3 className="text-center text-lg font-bold">{t("Confirmation de réservation", "Booking confirmation")}</h3>
              <p className="mt-5 flex items-center gap-2 text-lg font-bold">
                {t(offer.title, offer.titleEn)}
              </p>
              <p className="text-sm text-white/80">
                {offer.gym}, {offer.arrondissement}, {offer.distanceKm} km
              </p>

              <div className="mt-6 flex items-baseline justify-between border-t border-white/20 pt-4">
                <span className="text-lg font-bold text-gold">{t("Total", "Total")}</span>
                <span className="font-display text-2xl font-bold tabular-nums text-gold">
                  {formatEuro(price)}
                </span>
              </div>

              <p className="mt-4 font-mono text-xs text-white/70">
                {t("Référence :", "Reference:")} {ref}
              </p>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl bg-secondary/60 p-4 text-left text-sm">
              <p className="flex items-center gap-2 text-ink"><Clock className="h-4 w-4 text-brand" /> {slotLabel(offer.startsInHours, locale)}, {offer.durationMin} min</p>
              <p className="flex items-center gap-2 text-ink"><MapPin className="h-4 w-4 text-brand" /> {offer.address}</p>
              <p className="flex items-center gap-2 text-ink">
                <ShieldCheck className="h-4 w-4 text-brand" />
                {t("Confirmez votre identité à l'accueil au créneau indiqué.", "Confirm your name at the front desk at the time booked.")}
              </p>
            </div>

            <Button variant="gold" size="lg" className="mt-6 w-full" onClick={onClose}>
              {t("Terminé", "Done")}
            </Button>
            <Link
              href="/offres"
              className="mt-3 inline-block w-full text-center text-sm text-brand underline underline-offset-4"
            >
              Consulter nos autres offres de cours
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 text-brand">{icon}</span>
      <span className="text-ink-soft">{label}</span>
      <span className="ml-auto text-right font-medium text-ink">{value}</span>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink-soft">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-gold focus:ring-2 focus:ring-gold/30"
      />
    </label>
  );
}
