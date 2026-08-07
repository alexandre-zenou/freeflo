"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Zone « glisser ou télécharger une photo », façon LinkedIn.
 *
 * Retour client, deux fois :
 * · modale « Publier un cours » : photo du professeur (facultative) ;
 * · onglet Paramètres : photo de devanture du centre, horizontale, tout en haut.
 *
 * Démo : l'aperçu vit dans le navigateur (object URL), rien n'est téléversé.
 * Le jour où un back-end existe, seul `onFile` change.
 */
export function PhotoDrop({
  label,
  hint,
  aspect = "wide",
  tone = "light",
  className,
}: {
  label: string;
  hint?: string;
  /** `wide` : bandeau de devanture. `square` : portrait du professeur. */
  aspect?: "wide" | "square";
  /** `dark` : posé sur le fond bordeaux de la modale. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Libère l'object URL quand l'aperçu change ou que le composant disparaît.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return setError("Choisissez une image (JPEG, PNG ou WebP).");
    }
    if (file.size > 8 * 1024 * 1024) {
      return setError("Image trop lourde : 8 Mo maximum.");
    }
    setError(null);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setName(file.name);
  };

  const clear = () => {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setName(null);
    setError(null);
    if (input.current) input.current.value = "";
  };

  const dark = tone === "dark";

  return (
    <div className={className}>
      {label && (
        <p className={cn("mb-1.5 block text-sm font-medium", dark ? "text-white" : "text-ink")}>{label}</p>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed transition-colors",
          aspect === "wide" ? "aspect-[4/1] min-h-28" : "aspect-square max-w-40",
          dark
            ? over ? "border-gold bg-white/15" : "border-white/45 bg-white/5"
            : over ? "border-brand bg-brand-tint/50" : "border-line bg-pro-surface",
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={name ?? ""} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={clear}
              aria-label="Retirer la photo"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 text-center text-sm transition-colors",
              dark ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-ink",
            )}
          >
            <ImagePlus className="h-5 w-5" />
            <span>Glissez une photo ici, ou cliquez pour la choisir</span>
            {hint && <span className={cn("text-xs", dark ? "text-white/60" : "text-ink-soft/80")}>{hint}</span>}
          </button>
        )}
      </div>

      {error && <p className={cn("mt-2 text-xs", dark ? "text-gold" : "text-brand")}>{error}</p>}

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />
    </div>
  );
}
