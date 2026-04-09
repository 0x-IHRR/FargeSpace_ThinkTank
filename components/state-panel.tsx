import type { ReactNode } from "react";

type StatePanelProps = {
  tone:
    | "loading"
    | "empty"
    | "error"
    | "expired"
    | "unauthorized"
    | "not-found";
  title: string;
  description: string;
  actions?: ReactNode;
};

export function StatePanel({ tone, title, description, actions }: StatePanelProps) {
  return (
    <section className={`state-panel state-${tone}`}>
      <p className="state-kicker">{tone}</p>
      <h3>{title}</h3>
      <p>{description}</p>
      {actions ? <div className="state-actions">{actions}</div> : null}
    </section>
  );
}
