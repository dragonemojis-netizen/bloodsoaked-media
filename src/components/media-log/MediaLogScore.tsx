interface MediaLogScoreProps {
  score: number;
  className?: string;
}

/** Publication record — not a review-aggregator badge */
export function MediaLogScore({ score, className = "" }: MediaLogScoreProps) {
  return (
    <p className={`media-log-score ${className}`}>
      <span className="media-log-score__label">Score</span>
      <span className="media-log-score__value">{score}</span>
      <span className="media-log-score__scale">/ 100</span>
    </p>
  );
}
