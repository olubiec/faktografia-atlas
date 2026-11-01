import { Link } from 'react-router';

interface ComparisonCardProps {
  teryt1: string;
  teryt2: string;
  name1: string;
  name2: string;
}

function ComparisonCard({ teryt1, teryt2, name1, name2 }: ComparisonCardProps) {
  return (
    <Link
      to={`/?c=${teryt1},${teryt2}`}
      className="flex flex-col justify-center min-h-[88px] p-4 bg-tusz text-arkusz hover:bg-tusz/90 border border-tusz focus:outline-none focus:ring-2 focus:ring-tusz focus:ring-offset-2 focus:ring-offset-kalka"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-bold truncate">{name1}</span>
        <span className="text-sm text-arkusz/70 shrink-0">vs</span>
        <span className="font-bold truncate text-right">{name2}</span>
      </div>
    </Link>
  );
}

export function FeaturedComparisons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ComparisonCard teryt1="1465011" teryt2="1261011" name1="Warszawa" name2="Kraków" />
      <ComparisonCard teryt1="1001042" teryt2="2007062" name1="Kleszczów" name2="Przytuły" />
      <ComparisonCard teryt1="1217" teryt2="1801" name1="pow. tatrzański" name2="pow. bieszczadzki" />
      <ComparisonCard teryt1="3064011" teryt2="0264011" name1="Poznań" name2="Wrocław" />
      <ComparisonCard teryt1="2264011" teryt2="2261011" name1="Sopot" name2="Gdańsk" />
      <ComparisonCard teryt1="1217" teryt2="1211" name1="pow. tatrzański" name2="pow. nowotarski" />
    </div>
  );
}
