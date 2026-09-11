/** Campo de formulario con su etiqueta y su error. Compartido por ambos formularios. */
export function Campo({
  nombre,
  etiqueta,
  tipo = "text",
  requerido = false,
  autoComplete,
  error,
  textoError,
  filas,
}: {
  nombre: string;
  etiqueta: string;
  tipo?: "text" | "email";
  requerido?: boolean;
  autoComplete?: string;
  error?: string;
  textoError?: string;
  filas?: number;
}) {
  const clases =
    "rounded border border-tinta/25 bg-transparent px-4 py-3 font-texto text-tinta placeholder:text-tinta/40";
  const idError = error ? `${nombre}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-2 font-texto text-sm text-tinta/80">
        {etiqueta}
        {filas ? (
          <textarea name={nombre} rows={filas} className={clases} />
        ) : (
          <input
            name={nombre}
            type={tipo}
            required={requerido}
            autoComplete={autoComplete}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={idError}
            className={clases}
          />
        )}
      </label>
      {error ? (
        <p id={idError} role="alert" className="font-texto text-sm text-verde-texto">
          {textoError}
        </p>
      ) : null}
    </div>
  );
}
