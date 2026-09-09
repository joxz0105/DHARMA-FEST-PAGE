export function Cifra({
  valor,
  prefijo = "",
  sufijo = "",
  rotulo,
}: {
  valor: string | number;
  prefijo?: string;
  sufijo?: string;
  rotulo: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-texto text-sm text-hueso/80">{rotulo}</p>
      <p className="self-start rounded-xl border border-lima px-6 py-3 font-display text-5xl text-lima md:text-6xl">
        {prefijo}
        {valor}
        {sufijo}
      </p>
    </div>
  );
}
