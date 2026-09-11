"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/**
 * Héros de la maquette cliente : vidéo plein cadre (boxeuse, ring jaune puis
 * rouge), titre centré en gras, un seul bouton fantôme.
 *
 * Coût réseau — la vidéo était le premier poste de transfert du site. Deux
 * mesures, plutôt que de la couper :
 *
 * 1. **Deux encodages.** L'original fait 1280×720 (618 Ko en webm), ce qui n'a
 *    aucun sens sur un écran de 375 px. Une version 640 px (234 Ko) est servie
 *    en dessous de 768 px : 62 % de moins, sans différence visible à l'écran.
 * 2. **Le poster comme socle.** Il s'affiche immédiatement et reste seul si
 *    l'utilisateur est en « économiseur de données » ou en 2G. C'est une image
 *    du même plan : rien ne manque.
 */
type Variant = "none" | "mobile" | "desktop";

function useVideoVariant(): Variant {
  const [variant, setVariant] = useState<Variant>("none");

  useEffect(() => {
    const decide = () => {
      // `connection` n'existe pas partout : son absence n'est pas un refus.
      const conn = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      const saveData = conn?.saveData === true;
      /*
        On ne bloque que sur le vraiment lent (2G). Volontairement PAS sur « 3g » :
        beaucoup de navigateurs annoncent 3g par prudence, y compris sur des postes
        fixes câblés — la vidéo de la cliente ne se serait jamais affichée.
      */
      const slow = conn?.effectiveType ? /^(slow-)?2g$/.test(conn.effectiveType) : false;

      /*
        `prefers-reduced-motion` ne coupe PLUS la vidéo (décision cliente du
        22/08/2026) : la bannière doit être vue par tout le monde. Seules les
        deux raisons de coût réseau subsistent ci-dessus, parce qu'elles
        répondent à une demande explicite du visiteur d'économiser ses données.
      */
      if (saveData || slow) return setVariant("none");

      if (window.matchMedia("(min-width: 768px)").matches) return setVariant("desktop");

      /*
        Encodage mobile (640 px) seulement si l'écran en tire vraiment parti.
        En portrait, `object-cover` cadre sur la HAUTEUR : sur un iPhone 390x844
        la source est étirée à 1500 px de large, soit 4500 px réels en densité 3.
        Le fichier 640 px y est agrandi 7 fois et la vidéo de la cliente paraît
        floue. Au-delà de la densité 2, on sert donc l'encodage 1280 px.
      */
      const dense = window.devicePixelRatio >= 2;
      setVariant(dense ? "desktop" : "mobile");
    };

    decide();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", decide);
    return () => mq.removeEventListener("change", decide);
  }, []);

  return variant;
}

/**
 * Démarrage de la lecture sur iOS. Trois obstacles que Chrome ignore et que
 * Safari sur iPhone applique strictement :
 *
 * 1. **`muted` doit être un attribut du DOM**, pas seulement une propriété.
 *    React ne pose que la propriété : au moment où Safari évalue l'autoplay,
 *    la balise n'annonce pas qu'elle est muette et la lecture est refusée.
 * 2. **`autoplay` seul ne suffit pas toujours** : on rappelle `play()` une fois
 *    les premières données reçues. La promesse rejetée est normale (mode économie
 *    d'énergie) — on l'avale, le poster reste alors seul à l'écran.
 * 3. **iOS met la vidéo en pause en quittant l'onglet** et ne la reprend pas
 *    toujours au retour : on relance sur `visibilitychange`.
 *
 * `onBloque` est le filet de sécurité. Un navigateur qui s'engage sur une
 * source puis échoue à la DÉCODER ne retombe pas sur la suivante, à la
 * différence d'un échec de chargement : la vidéo reste noire, sans erreur, et
 * seul le poster subsiste. On surveille donc que la lecture a réellement
 * démarré, et on prévient l'appelant sinon.
 */
const DELAI_BLOCAGE = 2500;

function useAutoplay(enabled: boolean, onBloque: () => void) {
  const ref = useRef<HTMLVideoElement>(null);
  /* Passé par une ref : le rappel change d'identité à chaque rendu, et le
     mettre en dépendance relancerait la surveillance en boucle. */
  const bloque = useRef(onBloque);
  useEffect(() => {
    bloque.current = onBloque;
  }, [onBloque]);

  useEffect(() => {
    const v = ref.current;
    if (!enabled || !v) return;

    v.defaultMuted = true;
    v.muted = true;
    v.setAttribute("muted", "");

    const play = () => void v.play().catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === "visible") play();
    };
    /* Erreur franche : inutile d'attendre le délai. */
    const onError = () => bloque.current();

    /*
      RELANCER AU PREMIER GESTE, et c'est la pièce qui manquait.

      Le mode économie d'énergie d'iOS refuse la lecture automatique de TOUTE
      vidéo, même muette, et rien ne permet de passer outre. Un seul `play()`
      au montage se faisait donc refuser une fois pour toutes, et le poster
      restait à l'écran pour le reste de la visite.

      Or la restriction tombe dès que le visiteur a interagi avec la page. On
      réessaie donc au premier toucher, clic, touche ou défilement. C'est
      l'échappatoire prévue par les navigateurs, pas un contournement.

      `passive: true` : on ne bloque jamais un défilement, et le `scroll` reste
      fluide.

      Les écouteurs restent posés pour toute la vie du composant, et c'est
      délibéré. Une première version les retirait dès que la lecture démarrait ;
      la vidéo repartait bien du premier blocage, mais plus jamais ensuite. Or
      iOS remet en pause en quittant l'onglet, en verrouillant l'écran ou en
      passant en économie d'énergie : le filet doit tenir toute la visite, pas
      seulement la première seconde. Vérifié à la mesure, la première version
      échouait.

      Ne rien coûter quand tout va bien tient au test `v.paused` : sur une page
      qui joue déjà, chaque geste ne fait qu'une comparaison.
    */
    const GESTES = ["pointerdown", "touchstart", "keydown", "scroll"] as const;
    const surGeste = () => {
      if (v.paused) play();
    };
    const retirerGestes = () => {
      GESTES.forEach((e) => window.removeEventListener(e, surGeste));
    };
    GESTES.forEach((e) => window.addEventListener(e, surGeste, { passive: true }));

    play();
    /*
      Trois occasions de relancer au lieu d'une. `loadeddata` seul suppose que
      la première tentative n'a échoué que par manque de données ; `canplay` et
      `loadedmetadata` couvrent les navigateurs qui n'émettent pas les mêmes
      événements dans le même ordre.
    */
    v.addEventListener("loadeddata", play);
    v.addEventListener("loadedmetadata", play);
    v.addEventListener("canplay", play);
    v.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisible);

    /*
      Filet de dernier recours, volontairement TRÈS restrictif : il n'agit que
      si RIEN n'est arrivé, ni métadonnées ni le moindre octet mis en mémoire
      tampon. C'est la signature d'une source que le navigateur a acceptée puis
      abandonnée sans lever d'erreur.

      Il ne suffit PAS que la lecture n'ait pas commencé. Sur une connexion
      lente, la vidéo se charge encore, et basculer vers le MP4 relancerait un
      téléchargement plus LOURD de 170 Ko : on aggraverait la situation de
      celui qui a déjà le moins de débit. Or `moov` est en tête de nos fichiers,
      donc les métadonnées arrivent dès les premiers octets et `readyState`
      quitte 0 très tôt, même sur un lien poussif.

      Le cas courant, lui, est traité par l'écouteur `error` ci-dessus, qui est
      immédiat. Ce minuteur ne couvre que l'échec muet.

      Onglet caché : on ne conclut rien, le navigateur a le droit de ne pas
      lire, et `visibilitychange` relancera à son retour.
    */
    const minuteur = window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      const rienRecu = v.readyState === 0 && v.buffered.length === 0;
      if (rienRecu) bloque.current();
    }, DELAI_BLOCAGE);

    return () => {
      window.clearTimeout(minuteur);
      retirerGestes();
      v.removeEventListener("loadeddata", play);
      v.removeEventListener("loadedmetadata", play);
      v.removeEventListener("canplay", play);
      v.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);

  return ref;
}

export function Hero() {
  const t = useT();
  const variant = useVideoVariant();
  const suffix = variant === "mobile" ? "-mobile" : "";
  /*
    Profil H.264 réel des deux encodages, relevé dans leur atome `avcC` :
    High 3.1 pour le 1280, High 3.0 pour le 640. Déclarer le bon évite qu'un
    navigateur écarte à tort un fichier qu'il sait pourtant lire.
  */
  const avc = variant === "mobile" ? "avc1.64001E" : "avc1.64001F";

  /*
    Deuxième tentative, en MP4 seul.

    Le WebM est proposé en premier parce qu'il est plus léger de 170 Ko, et les
    codecs déclarés plus bas suffisent normalement à ce qu'un navigateur qui ne
    sait pas lire du VP9 l'écarte de lui-même. « Normalement » : certains
    répondent « maybe » et s'engagent quand même. La sanction est alors muette,
    le poster reste seul, et c'est précisément ce qu'on nous a rapporté.

    Ce repli ne coûte rien à ceux que ça ne concerne pas : il ne se déclenche
    que si la lecture n'a pas démarré.
  */
  const [replier, setReplier] = useState(false);
  const surBlocage = useCallback(() => setReplier(true), []);
  const videoRef = useAutoplay(variant !== "none", surBlocage);

  return (
    <section className="relative min-h-dvh overflow-hidden bg-brand-deep">
      <div className="absolute inset-0">
        {/* Toujours présent : c'est le rendu de base, et le poster de la vidéo. */}
        <Image
          src="/video/hero-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {variant !== "none" && (
          /* `key` : changer de variante remonte l'élément, sinon le navigateur
             garderait la source déjà chargée. */
          <video
            key={`${variant}${replier ? "-mp4" : ""}`}
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            /*
              `auto` et non `metadata`. Avec `metadata`, le navigateur ne
              récupérait que l'en-tête, puis attendait pour chercher les images :
              la lecture ne pouvait pas commencer avant un second aller-retour,
              ce qui se voit sur un réseau mobile. La vidéo allait de toute
              façon être téléchargée, `metadata` ne faisait que retarder le
              départ. Ceux qui ne doivent pas la charger du tout sont déjà
              écartés en amont par `useVideoVariant`, sur `Save-Data` et la 2G.
            */
            preload="auto"
            poster="/video/hero-poster.jpg"
            aria-hidden
          >
            {/*
              LES CODECS SONT DÉCLARÉS, et ce n'est pas cosmétique.

              Sans eux, `type="video/webm"` seul fait répondre « maybe » à
              Safari, qui s'engage alors sur le WebM parce qu'il arrive en
              premier, puis échoue à le décoder : nos WebM sont en VP9, que
              Safari ne lit pas dans ce conteneur. Un échec de DÉCODAGE ne
              fait pas retomber sur la source suivante, à la différence d'un
              échec de chargement. La vidéo ne démarrait donc jamais, sans la
              moindre erreur, et seul le poster restait à l'écran. C'est le
              symptôme rapporté le 28/08/2026 sur d'autres navigateurs et
              d'autres téléphones.

              Avec le codec déclaré, Safari répond « » pour le VP9, passe au
              MP4 et lit. Chrome et Firefox répondent « probably » et gardent
              le WebM, plus léger de 170 Ko : l'économie de transfert est
              préservée pour ceux qui peuvent en profiter.

              Corollaire : en réencodant ces fichiers, mettre CES chaînes à
              jour. Une chaîne fausse écarte le fichier au lieu de le lire.
            */}
            {!replier && (
              <source src={`/video/hero${suffix}.webm`} type='video/webm; codecs="vp9"' />
            )}
            <source src={`/video/hero${suffix}.mp4`} type={`video/mp4; codecs="${avc}"`} />
          </video>
        )}

        {/* voile rouge : assoit le contraste du titre par-dessus la vidéo */}
        <div className="absolute inset-0 bg-brand-deep/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_50%,rgba(131,6,6,0.5),rgba(131,6,6,0.12)_62%,transparent_82%)]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="display rise max-w-5xl text-[clamp(2.5rem,7vw,5.5rem)] text-white [text-shadow:0_2px_30px_rgba(60,2,2,0.6)]">
          {t("Burn Calories, Not Cash")}
        </h1>

        <div className="rise mt-10" style={{ animationDelay: "0.18s" }}>
          <Button asChild size="lg" variant="ghostline">
            <Link href="/offres">{t("Trouver mon cours de sport", "Find my class")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
