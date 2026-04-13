type RouteShellProps = {
  title: string;
  path: string;
  description: string;
};

export function RouteShell({ title, path, description }: RouteShellProps) {
  return (
    <section className="route-shell">
      <p className="route-path">{path.startsWith("/") ? "资料库页面" : path}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
