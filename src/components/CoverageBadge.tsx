import type { CoverageStatus } from "../types/models";

interface CoverageBadgeProps {
  label: string;
  status: CoverageStatus;
}

export default function CoverageBadge({ label, status }: CoverageBadgeProps) {
  return (
    <span className="coverage-badge" data-status={status}>
      <span className="coverage-dot" />
      <span>{label}</span>
    </span>
  );
}
