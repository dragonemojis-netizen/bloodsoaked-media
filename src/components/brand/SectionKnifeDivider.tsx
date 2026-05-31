import { KnifeMotif } from "./KnifeMotif";

export function SectionKnifeDivider() {
  return (
    <div
      className="section-knife-divider my-8 flex items-center gap-4"
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-border-subtle" />
      <KnifeMotif corner="inline" className="!relative !opacity-[0.2]" />
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
