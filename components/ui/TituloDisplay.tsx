export function TituloDisplay({
  como: Como = "h2",
  italica = false,
  className = "",
  children,
}: {
  como?: "h1" | "h2" | "h3";
  italica?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Como className={`font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl ${className}`}>
      {italica ? <em className="italic">{children}</em> : children}
    </Como>
  );
}
