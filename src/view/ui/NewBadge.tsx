// Etykieta „Nowość” (W28-D06): krótki znacznik przy świeżych danych. Tylko tokeny, bez animacji.
export function NewBadge() {
  return (
    <span
      aria-label="Nowe dane"
      className="ml-2 inline-block max-w-full whitespace-nowrap border border-tusz px-1 align-middle text-xs font-bold leading-normal text-tusz"
    >
      Nowość
    </span>
  );
}
