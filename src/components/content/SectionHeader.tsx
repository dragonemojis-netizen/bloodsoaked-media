import { KnifeMotif } from "@/components/brand/KnifeMotif";

interface SectionHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  showKnife?: boolean;
}

export function SectionHeader({
  title,
  description,
  eyebrow = "Section",
  showKnife = false,
}: SectionHeaderProps) {
  return (
    <header className="relative mb-10 border-b border-border-subtle pb-8">
      {showKnife && (
        <KnifeMotif corner="br" className="!right-0 !top-0 !opacity-[0.1]" />
      )}
      <p className="font-mono text-meta uppercase tracking-[0.28em] text-accent-bright">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-serif text-4xl text-foreground">{title}</h1>
      <p className="section-lead mt-4 max-w-2xl text-foreground-muted leading-relaxed">
        {description}
      </p>
    </header>
  );
}
