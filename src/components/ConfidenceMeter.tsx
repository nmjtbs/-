interface ConfidenceMeterProps {
  score: number;
  label: string;
  copy: string;
}

export default function ConfidenceMeter({
  score,
  label,
  copy,
}: ConfidenceMeterProps) {
  return (
    <div className="confidence-meter">
      <div className="confidence-meter-row">
        <strong>{label}</strong>
        <span className="small">{score}%</span>
      </div>
      <div className="confidence-meter-track">
        <div className="confidence-meter-fill" style={{ width: `${score}%` }} />
      </div>
      <div className="confidence-meter-copy">{copy}</div>
    </div>
  );
}
