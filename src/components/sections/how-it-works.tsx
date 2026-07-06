import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { steps } from "@/lib/site";

export function HowItWorks() {
  return (
    <section className="ff-container py-24 md:py-32">
      <SectionHeading
        title={<>Découvrir. Réserver.<br />Se pointer. Profiter.</>}
        intro="La simplicité de Too Good To Go, appliquée au sport. Aucune application à installer : tout se passe dans le navigateur."
      />

      <Reveal stagger={0.12} className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="border-t border-ink/20 pt-5">
            <div className="flex items-baseline gap-3">
              <span className="serif-em text-3xl text-peri-deep">{s.n}</span>
              <h3 className="text-xl font-medium text-ink">{s.title}</h3>
            </div>
            <p className="mt-4 max-w-[26ch] text-sm leading-relaxed text-ink-soft">{s.text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
