/**
 * Zajawka kolumny profilu na komputerze: rezerwuje miejsce od chwili wyboru jednostki,
 * żeby kamera liczyła cel dla już węższej mapy (bez przestrzelenia zoomu).
 */
export function ProfileColumnPlaceholder({ name }: { name?: string | null }) {
  return (
    <div className="p-4 flex flex-col gap-2">
      {name ? <h2 className="text-lg font-semibold text-tusz">{name}</h2> : null}
      <p role="status" className="text-sm text-olowek animate-pulse motion-reduce:animate-none">
        Wczytywanie profilu…
      </p>
    </div>
  );
}

export default ProfileColumnPlaceholder;
