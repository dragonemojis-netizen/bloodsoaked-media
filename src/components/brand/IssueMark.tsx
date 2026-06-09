interface IssueMarkProps {
  issue?: string;
  year?: number;
  className?: string;
}

export function IssueMark({
  issue = String(new Date().getMonth() + 1).padStart(2, "0"),
  year = new Date().getFullYear(),
  className = "",
}: IssueMarkProps) {
  return (
    <span
      className={`issue-mark inline-block border border-accent/50 bg-accent/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.28em] text-accent-bright ${className}`}
    >
      Issue {issue} · {year}
    </span>
  );
}
