"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { PillSelect } from "@/components/ui/pill-select";
import { BudgetFilter } from "@/components/ui/budget-filter";
import { StudioFilter } from "@/components/ui/studio-filter";
import { RevealOnView } from "@/components/reveal-on-view";
import { RevealLines } from "@/components/reveal";
import { MapView, type MapPoint } from "@/components/offers/map-view";
import { distanceKm } from "@/lib/geo";
import { useGeolocation } from "@/components/use-geolocation";
import { categories, categoryOf, dayBucket, offers } from "@/lib/site";
import { computePrice } from "@/lib/pricing";
import { formatEuro, timeLabel } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { useHydrated } from "@/lib/account";
import { PriceCalendar, type CalendarDay } from "@/components/offers/price-calendar";
import { dayIso, isoDayLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/** « 850 m » en dessous du kilomètre, « 1,2 km » au-delà. */
function formatKm(km: number, t: (fr: string, en?: string) => string): string {
  if (km < 1) return `${Math.round(km * 100) * 10} m`;
  return t(`${km.toFixed(1).replace(".", ",")} km`, `${km.toFixed(1)} km`);
}

/**
 * Recherche cartographique, partagée par l'accueil et par « Trouver un cours ».
 *
 * Un seul composant pour les deux écrans, et non deux copies : le projet a déjà
 * vu `dayBucket` se dupliquer trois fois et diverger. Les valeurs par défaut
 * sont exactement le comportement de l'accueil, dont l'appel reste `<MapSearch />`.
 *
 * `calendrier` est la seule vraie différence : sur `/offres`, une bande de jours
 * cliquables ouvre la page et c'est elle qui décide du contenu du panneau. Sans
 * elle, le panneau montre les créneaux de demain, comme sur l'accueil.
 */
export function MapSearch({
  titre,
  lienCatalogue = true,
  autoLocate = true,
  calendrier = false,
}: {
  /**
   * Titre de la section. `h1` le promeut en titre principal de la page, et
   * `ton` choisit sa couleur : l'accueil a déjà son `h1` dans le héros et son
   * rouge de marque, une page qui n'a que cette section a besoin des deux.
   */
  titre?: { fr: string; en: string; h1?: boolean; ton?: "brand" | "ink" };
  /** Raccourci « Voir toutes les offres ». Inutile sur la page qu'il vise. */
  lienCatalogue?: boolean;
  /** Demander la position au chargement. L'accueil le fait, pas les autres. */
  autoLocate?: boolean;
  /** Bande de jours avec prix d'appel, au-dessus des filtres. */
  calendrier?: boolean;
} = {}) {
  const router = useRouter();
  const t = useT();
  const [cat, setCat] = useState("");
  const [jour, setJour] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  /*
    Un clic, deux effets, selon que l'item est déjà choisi ou non.

    Premier clic : on sélectionne, la carte se recentre, rien ne navigue. Second
    clic sur le MÊME item : on ouvre sa fiche. Cliquer un autre item repart à
    zéro, c'est un premier clic sur celui-là.

    C'est l'état qui tranche, plus un minuteur : le double clic rapide imposait
    au visiteur une contrainte de vitesse, et obligeait à retarder chaque clic
    simple de 220 ms pour départager les deux. Ici, rien n'attend.
  */
  const cliquer = (id: string) => {
    if (selected === id) {
      router.push(`/offres/${id}`);
      return;
    }
    setSelected(id);
  };

  /*
    Pastille cliquée sur la carte : on sélectionne, et on amène la ligne
    correspondante sous les yeux. Elle peut ne pas être dans la liste, qui ne
    montre que les créneaux de demain : dans ce cas rien ne défile, et c'est
    volontaire plutôt que de fausser la liste.
  */
  const listeRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!selected) return;
    listeRef.current
      ?.querySelector(`[data-offre="${selected}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);
  /*
    Sur l'accueil, la position est demandée au CHARGEMENT (le hook laisse la page
    peindre d'abord, et n'ouvre rien si la permission est déjà tranchée). Refus,
    échec ou navigateur sans géolocalisation : la carte reste sur Paris et rien
    ne le signale, personne n'ayant rien demandé.
  */
  const geo = useGeolocation({ auto: autoLocate });
  const me = geo.position;

  /*
    Prix du moment de chaque offre, celui-là même qu'affichent les pastilles de
    la carte. On filtre donc sur ce que le visiteur VOIT, et non sur le prix
    plein, qui ne lui est montré que barré. `computePrice` ne dépend que de
    `startsInHours` : aucune `Date`, donc rien qui diverge à l'hydratation.
  */
  const prixDe = useMemo(() => {
    const m = new Map<string, number>();
    offers.forEach((o) =>
      m.set(o.id, computePrice(o.basePrice, o.placesLeft, o.startsInHours).currentPrice),
    );
    return m;
  }, []);

  /* Le vivier sur lequel portent les bornes du budget : tout ce que le filtre
     « Type de cours » laisse passer, avant que le budget ne s'applique. */
  const avantBudget = useMemo(
    () => offers.filter((o) => !cat || o.category === cat),
    [cat],
  );

  const bornes = useMemo((): [number, number] => {
    const prix = avantBudget.map((o) => prixDe.get(o.id) ?? 0);
    return prix.length ? [Math.floor(Math.min(...prix)), Math.ceil(Math.max(...prix))] : [0, 0];
  }, [avantBudget, prixDe]);

  /*
    `null` signifie « toute la plage », et non une valeur figée : changer de
    type de cours déplace les bornes, et une plage mémorisée en chiffres
    deviendrait vite incohérente. On la borne aussi à l'affichage, pour le cas
    où le vivier se resserre sous une sélection déjà faite.
  */
  const [studios, setStudios] = useState<string[]>([]);
  const [budget, setBudget] = useState<[number, number] | null>(null);
  /* Mémorisé : un nouveau tableau à chaque rendu invaliderait le `useMemo` de
     la liste, qui refiltrerait les 18 offres sans raison. */
  const plage = useMemo(
    (): [number, number] =>
      budget ? [Math.max(budget[0], bornes[0]), Math.min(budget[1], bornes[1])] : bornes,
    [budget, bornes],
  );
  const budgetActif = budget !== null && (plage[0] > bornes[0] || plage[1] < bornes[1]);

  /* Douze tranches : assez pour dessiner une silhouette, assez peu pour que
     chaque barre reste cliquable du regard sur 19 rem de large. */
  const bins = useMemo(() => {
    const [lo, hi] = bornes;
    const n = 12;
    const seaux = new Array(n).fill(0);
    const etendue = Math.max(1, hi - lo);
    avantBudget.forEach((o) => {
      const prix = prixDe.get(o.id) ?? 0;
      const i = Math.min(n - 1, Math.floor(((prix - lo) / etendue) * n));
      seaux[i] += 1;
    });
    return seaux;
  }, [avantBudget, bornes, prixDe]);

  /*
    Les studios proposés ne sont pas tout le carnet d'adresses : seulement ceux
    qui ont encore une offre APRÈS le type de cours et le budget. Cocher un nom
    ne peut donc jamais donner zéro résultat par surprise, et le compte affiché
    à côté annonce d'avance ce qu'on obtiendra.
  */
  const studiosDisponibles = useMemo(() => {
    const compte = new Map<string, number>();
    avantBudget
      .filter((o) => {
        const prix = prixDe.get(o.id) ?? 0;
        return prix >= plage[0] && prix <= plage[1];
      })
      .forEach((o) => compte.set(o.gym, (compte.get(o.gym) ?? 0) + 1));
    return [...compte.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [avantBudget, plage, prixDe]);

  const list = useMemo(() => {
    /* Les trois filtres se combinent en ET : chacun retranche sur ce que les
       précédents ont laissé. Un tableau de studios vide ne retranche rien. */
    const filtered = offers.filter((o) => {
      if (cat && o.category !== cat) return false;
      const prix = prixDe.get(o.id) ?? 0;
      if (prix < plage[0] || prix > plage[1]) return false;
      if (studios.length > 0 && !studios.includes(o.gym)) return false;
      return true;
    });
    if (!me) return filtered;
    /* Position connue : le plus proche d'abord, à heure de départ égale l'ordre
       du catalogue (déjà trié par imminence) départage. */
    return [...filtered].sort(
      (a, b) =>
        distanceKm(me, { lat: a.lat, lng: a.lng }) - distanceKm(me, { lat: b.lat, lng: b.lng }),
    );
  }, [cat, me, prixDe, plage, studios]);

  /*
    Le panneau de gauche ne montre plus des CENTRES triés par distance, mais les
    CRÉNEAUX DE DEMAIN, du plus tôt au plus tard. La carte, elle, continue
    d'afficher tout le catalogue filtré : c'est volontaire, et c'est aussi la
    limite de ce parti pris. Le compteur du panneau et le nombre de pastilles
    ne coïncident donc plus.

    « Demain » se déduit du seul `startsInHours`, jamais d'une `Date` : le
    serveur et le navigateur doivent produire le même balisage.
  */
  const demain = useMemo(
    () =>
      list
        .filter((o) =>
          calendrier && jour !== null
            ? dayIso(o.startsInHours) === jour
            : dayBucket(o.startsInHours) === "tomorrow",
        )
        .sort((a, b) => a.startsInHours - b.startsInHours),
    [list, calendrier, jour],
  );

  /*
    L'heure exige `Date.now()`, absent du rendu serveur. On ne l'affiche donc
    qu'une fois hydraté, sinon les deux rendus divergeraient d'une minute à
    l'autre et React s'en plaindrait.
  */
  const hydrated = useHydrated();
  const { locale } = useLocale();

  /*
    Quatorze jours et leur prix d'appel. Calculés seulement une fois hydraté :
    les dates n'existent pas au rendu statique, et le jour de la compilation
    n'est pas celui de la visite.
  */
  const jours = useMemo((): CalendarDay[] => {
    if (!calendrier || !hydrated) return [];
    const parJour = new Map<string, number>();
    offers.forEach((o) => {
      const iso = dayIso(o.startsInHours);
      const prix = prixDe.get(o.id) ?? Infinity;
      parJour.set(iso, Math.min(parJour.get(iso) ?? Infinity, prix));
    });

    const liste: CalendarDay[] = [];
    for (let i = 0; i < 14; i++) {
      const iso = dayIso(i * 24);
      const from = parJour.get(iso);
      liste.push({ iso, from: from === undefined ? null : from, best: false });
    }
    /* Un seul jour porte le badge : le premier au meilleur prix, pour ne pas
       marquer trois cases à égalité et diluer le repère. */
    const mini = Math.min(...liste.map((d) => d.from ?? Infinity));
    const gagnant = liste.find((d) => d.from === mini);
    if (gagnant && Number.isFinite(mini)) gagnant.best = true;
    return liste;
  }, [calendrier, hydrated, prixDe]);

  /* Sans filtre ET sans position, la carte reste sur la vue d'ensemble de
     Paris. Dès que le visiteur resserre sa recherche, elle suit ses résultats. */
  const hasFilters = Boolean(cat);

  /* Les trois cours les plus proches : ils règlent le cadrage de la carte quand
     la position arrive, pour que le zoom montre le voisinage et non la France. */
  const focus = useMemo(() => (me ? list.slice(0, 3) : []), [list, me]);

  const points: MapPoint[] = useMemo(
    () =>
      list.map((o) => {
        const p = computePrice(o.basePrice, o.placesLeft, o.startsInHours);
        return { id: o.id, lat: o.lat, lng: o.lng, label: formatEuro(p.currentPrice), hot: p.heat > 0.6 };
      }),
    [list],
  );

  return (
    <section className="ff-container pb-16 pt-0 md:pb-20 md:pt-0">
      {/* Titre à gauche, raccourci vers le catalogue complet en haut à droite. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {/* Titre fixe : le décompte, lui, vit dans l'en-tête du panneau, où il
            est lu au moment où l'on regarde la liste qu'il annonce. */}
        <RevealLines
          as={titre?.h1 ? "h1" : "h2"}
          className={cn(
            "display text-[clamp(1.75rem,3.4vw,2.6rem)]",
            titre?.ton === "ink" ? "text-ink" : "text-brand",
          )}
        >
          {titre
            ? t(titre.fr, titre.en)
            : t("Nos offres de dernière minute", "Our last-minute offers")}
        </RevealLines>

        {lienCatalogue && (
          <Link
            href="/offres"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/35 px-4 py-2 text-sm text-brand transition-colors hover:bg-brand hover:text-white"
          >
            <Search className="h-4 w-4" /> {t("Voir toutes les offres", "See all offers")}
          </Link>
        )}
      </div>

      {calendrier && (
        /* Le choix du jour commande tout le reste : il ouvre donc la page, avant
           les filtres qui portent sur le contenu d'un jour déjà choisi. Avant
           hydratation il n'y a pas de dates, on réserve la hauteur plutôt que
           de laisser la page sauter quand la bande apparaît. */
        <div className="mt-6">
          {jours.length > 0 ? (
            <PriceCalendar days={jours} selected={jour ?? dayIso(24)} onSelect={setJour} />
          ) : (
            <div className="h-[7.5rem] animate-pulse rounded-2xl bg-secondary/60" />
          )}
        </div>
      )}

      {/* Pastilles ovales (retour client : les listes déroulantes natives
          « font trop old school »). */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <PillSelect
          label={t("Type de cours", "Class type")}
          value={cat}
          onChange={setCat}
          options={categories.map((c) => ({ value: c.slug, label: c.label }))}
        />

        <BudgetFilter
          min={bornes[0]}
          max={bornes[1]}
          value={plage}
          bins={bins}
          active={budgetActif}
          onChange={setBudget}
          onReset={() => setBudget(null)}
        />

        <StudioFilter options={studiosDisponibles} value={studios} onChange={setStudios} />
      </div>

      {geo.state === "denied" && geo.askedByUser && (
        <p className="mt-2 text-xs text-brand">
          {t(
            "Localisation refusée. La carte reste sur la vue d'ensemble de Paris.",
            "Location denied. The map stays on the overview of Paris.",
          )}
        </p>
      )}

      {/* Les activités à gauche, la carte à droite (demande cliente 08/2026). */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.9fr]">
        {/* Sur téléphone la carte reste en tête, les deux colonnes n'existant
            qu'à partir de `lg` : c'est `order` qui les échange, pas l'ordre du
            code, pour que la carte n'ouvre pas la page sur un écran étroit. */}
        <RevealOnView className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-line sm:aspect-[16/10] lg:order-2 lg:aspect-auto lg:h-[720px]">
          <MapView
            points={points}
            /* La sélection prime sur le survol : elle dure, il passe. */
            activeId={selected ?? hover}
            onHover={setHover}
            focusId={selected}
            onSelect={cliquer}
            showUser
            me={me}
            focus={focus}
            onLocate={() => geo.request()}
            locating={geo.state === "asking"}
            fitBounds={hasFilters}
          />
        </RevealOnView>

        {/* panneau de résultats, avec la disponibilité de chaque centre */}
        <div className="flex flex-col overflow-hidden rounded-3xl bg-paper ring-1 ring-line lg:order-1 lg:h-[720px]">
          {/* Le compte se voit de loin : chiffre en pastille rouge pleine, comme
              les pastilles de prix sur la carte. L'or a été écarté ici, illisible
              sur blanc (le contraste tombe à 1,5:1), il reste réservé aux prix
              posés sur le bordeaux. */}
          <p className="flex shrink-0 items-center gap-2.5 border-b border-line bg-brand-tint px-5 py-3 text-sm text-ink">
            <span className="grid h-7 min-w-7 place-items-center rounded-full bg-brand px-2 text-sm font-bold text-white">
              {demain.length}
            </span>
            <span className="font-medium text-brand">
              {calendrier && hydrated
                ? t(
                    `${demain.length > 1 ? "créneaux" : "créneau"}, ${isoDayLabel(jour ?? dayIso(24), locale)}`,
                    `${demain.length > 1 ? "slots" : "slot"}, ${isoDayLabel(jour ?? dayIso(24), locale)}`,
                  )
                : demain.length > 1
                  ? t("créneaux disponibles demain", "slots available tomorrow")
                  : t("créneau disponible demain", "slot available tomorrow")}
            </span>
          </p>
          <ul ref={listeRef} className="divide-y divide-line overflow-y-auto">
            {demain.map((o) => {
              const available = o.placesLeft > 0;
              return (
                <li key={o.id}>
                  <button
                    data-offre={o.id}
                    onMouseEnter={() => setHover(o.id)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => cliquer(o.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors",
                      selected === o.id ? "bg-brand-tint" : "hover:bg-secondary",
                    )}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image src={o.image} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{o.gym}</span>
                      {/*
                        Séparateur : la virgule, pas le point médian. Le retour
                        client du 07/08 barre explicitement les points médians
                        décoratifs, qu'il identifie comme des marqueurs de
                        Claude (point F7). L'heure ferme la ligne, c'est elle
                        qui justifie que le créneau soit là.
                      */}
                      <span className="flex items-center gap-1 text-xs text-ink-soft">
                        <Star className="h-3 w-3 text-gold" fill="currentColor" />
                        {o.rating.toFixed(1)} {t(categoryOf(o.category).label, categoryOf(o.category).labelEn)}
                        {me && (
                          <>
                            {", "}
                            {formatKm(distanceKm(me, { lat: o.lat, lng: o.lng }), t)}
                          </>
                        )}
                        {hydrated && (
                          <>
                            {", "}
                            <span className="font-medium text-ink">{timeLabel(o.startsInHours, locale)}</span>
                          </>
                        )}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs font-medium",
                          available ? "text-emerald-700" : "text-brand",
                        )}
                      >
                        {available ? t("Disponible", "Available") : t("Non disponible", "Unavailable")}
                      </span>
                    </span>

                    {/*
                      Le prix du moment, à droite et centré sur toute la hauteur
                      de la ligne : c'est le même nombre que la pastille de la
                      carte, il vient du même `prixDe`, et il ne peut donc pas
                      la contredire. `tabular-nums` aligne les chiffres d'une
                      ligne à l'autre, `shrink-0` l'empêche d'être écrasé par un
                      nom de studio long.
                    */}
                    <span className="shrink-0 pl-2 text-base font-bold tabular-nums text-brand">
                      {formatEuro(prixDe.get(o.id) ?? 0)}
                    </span>
                  </button>
                </li>
              );
            })}
            {demain.length === 0 && (
              <li className="px-5 py-6 text-sm text-ink-soft">
                {t("Aucun créneau demain sur ces critères.", "No slot tomorrow matches these filters.")}
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
