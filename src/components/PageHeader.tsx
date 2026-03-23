import type { ActionButton } from "../types/models";

function HeaderAction({ action }: { action: ActionButton }) {
  const className = action.tone === "primary" ? "button primary" : "button ghost";
  return (
    <button className={className} type="button">
      {action.label}
    </button>
  );
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: ActionButton[];
}

export default function PageHeader({
  eyebrow,
  title,
  copy,
  actions = [],
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <div className="page-header-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <div className="page-header-actions">
        {actions.map((action) => (
          <HeaderAction key={action.label} action={action} />
        ))}
      </div>
    </header>
  );
}
