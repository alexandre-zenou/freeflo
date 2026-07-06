import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { steps } from "@/lib/site";

export function HowItWorks() {
  return (
    <section className="ff-container py-24 md:py-32">
      <SectionHeading
        eyebrow="4 étapes, zéro friction"
        title={<>Découvrir. Réserver.<br />Se pointer. Profiter.</>}
        intro="La simplicité de Too Good To Go, appliquée au sport. Aucune application à installer : tout se passe dans le navigateur."
      />

      <Reveal stagger={0.12} className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="group bg-paper p-8 transition-colors hover:bg-peri-tint/40">
            <span className="font-display text-5xl font-light text-peri transition-colors group-hover:text-peri-deep">
              {s.n}
            </span>
            <h3 className="mt-6 text-xl font-medium text-ink">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
