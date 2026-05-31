interface KnifeMotifProps {
  className?: string;
  /** Corner placement for decorative use */
  corner?: "tl" | "tr" | "bl" | "br" | "inline";
}

const cornerClasses: Record<NonNullable<KnifeMotifProps["corner"]>, string> = {
  tl: "absolute left-3 top-3 rotate-[-35deg] opacity-[0.12]",
  tr: "absolute right-3 top-3 rotate-[35deg] scale-x-[-1] opacity-[0.12]",
  bl: "absolute bottom-3 left-3 rotate-[145deg] opacity-[0.12]",
  br: "absolute bottom-3 right-3 rotate-[-145deg] scale-x-[-1] opacity-[0.14]",
  inline: "inline-block opacity-[0.35] text-accent-bright",
};

export function KnifeMotif({ className = "", corner = "inline" }: KnifeMotifProps) {
  return (
    <svg
      viewBox="0 0 48 80"
      className={`knife-motif h-8 w-5 text-accent-bright ${cornerClasses[corner]} ${className}`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M8 4 12 52 14 76 18 76 16 52 22 4ZM22 4 38 8 42 14 24 12Z"
      />
    </svg>
  );
}
