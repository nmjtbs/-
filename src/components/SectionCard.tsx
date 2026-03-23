import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  copy?: string;
  extra?: ReactNode;
  bodyClass?: string;
  children: ReactNode;
}

export default function SectionCard({
  title,
  copy,
  extra,
  bodyClass = "",
  children,
}: SectionCardProps) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <div>
          <h2 className="section-card-title">{title}</h2>
          {copy ? <p className="section-card-copy">{copy}</p> : null}
        </div>
        {extra ?? null}
      </div>
      <div className={`section-card-body ${bodyClass}`.trim()}>{children}</div>
    </section>
  );
}
