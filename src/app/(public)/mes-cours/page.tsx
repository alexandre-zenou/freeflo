import type { Metadata } from "next";
import { MyCourses } from "@/components/auth/my-courses";

export const metadata: Metadata = {
  title: "Mes cours",
  description: "Vos cours FREEFLO à venir, et ceux déjà passés.",
  robots: { index: false, follow: false },
};

/*
  Dans le groupe `(public)`, comme `/compte` : c'est un écran de CLIENT, qui se
  sert du site autour et doit pouvoir retourner au catalogue. Seul `/pro` est
  cloisonné.
*/
export default function MesCoursPage() {
  return (
    <main className="min-h-[70dvh] bg-cream pt-28 md:pt-32">
      <MyCourses />
    </main>
  );
}
