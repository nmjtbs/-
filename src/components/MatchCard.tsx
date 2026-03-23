import type { QueueMatchViewModel } from "../types/models";
import ConfidenceMeter from "./ConfidenceMeter";
import CoverageBadge from "./CoverageBadge";

interface MatchCardProps {
  match: QueueMatchViewModel;
  onSelect?: (matchId: string) => void;
}

export default function MatchCard({ match, onSelect }: MatchCardProps) {
  return (
    <article
      className="match-card"
      onClick={onSelect ? () => onSelect(match.id) : undefined}
      style={onSelect ? { cursor: "pointer" } : undefined}
    >
      <div className="match-card-top">
        <div>
          <div className="match-card-issue">{match.issue}</div>
          <div className="match-card-title">{match.title}</div>
          <div className="match-card-copy">{match.subtitle}</div>
        </div>
        <CoverageBadge {...match.coverage} />
      </div>
      <div className="match-card-metrics">
        {match.metrics.map((metric) => (
          <div className="metric-tile" key={metric.label}>
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
          </div>
        ))}
      </div>
      <div className="match-card-bottom">
        <ConfidenceMeter {...match.confidence} />
      </div>
    </article>
  );
}
