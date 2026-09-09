export function Seccion({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative px-6 py-24 md:px-12 lg:px-20 ${className}`}>
      {children}
    </section>
  );
}
