import { Link } from 'react-router';
import indicatorsData from '../../../config/indicators.json';

export interface IndicatorRecord {
  id: string;
  bdlVarId: number;
  name: string;
  unit: string;
  description: string;
  group: string;
  higherIsBetter: boolean | null;
  minLevel: string;
}

const indicators = indicatorsData as IndicatorRecord[];

function formatLevel(level: string): string {
  switch (level) {
    case 'gmi':
      return 'Gmina';
    case 'pow':
      return 'Powiat';
    case 'woj':
      return 'Województwo';
    default:
      return level;
  }
}

/**
 * Tabela 20 głównych wskaźników Faktografii z kodami zmiennych GUS BDL,
 * poziomem agregacji i bezpośrednimi linkami do otwarcia na mapie.
 */
export function SourcesIndicatorTable() {
  return (
    <div className="overflow-x-auto border border-linia bg-arkusz">
      <table
        className="w-full text-left text-sm border-collapse"
        aria-label="Wykaz 20 głównych wskaźników BDL GUS"
      >
        <caption className="sr-only">
          Wykaz 20 głównych wskaźników BDL GUS z kodami zmiennych, działem, poziomem agregacji i jednostką
        </caption>
        <thead className="border-b border-linia bg-kalka/60 text-xs text-olowek font-medium tracking-wider">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Wskaźnik
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Dział
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Kod BDL
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Poziom
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Jednostka
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-right">
              Akcja
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-linia text-tusz">
          {indicators.map((indicator) => (
            <tr
              key={indicator.id}
              className="hover:bg-kalka/40 transition-colors"
            >
              <td className="px-4 py-3">
                <span className="font-medium text-tusz block">
                  {indicator.name}
                </span>
                {indicator.description && (
                  <span className="text-xs text-olowek block mt-0.5 max-w-[45ch]">
                    {indicator.description}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-olowek whitespace-nowrap">
                {indicator.group}
              </td>
              <td className="px-4 py-3 text-sm font-mono tabular-nums whitespace-nowrap">
                {indicator.bdlVarId}
              </td>
              <td className="px-4 py-3 text-sm text-olowek whitespace-nowrap">
                {formatLevel(indicator.minLevel)}
              </td>
              <td className="px-4 py-3 text-sm text-olowek font-mono whitespace-nowrap">
                {indicator.unit}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Link
                  to={`/?i=${indicator.id}`}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-semibold bg-arkusz text-tusz border border-linia hover:border-tusz focus:outline-none focus:ring-2 focus:ring-tusz transition-colors rounded-none"
                  aria-label={`Otwórz na mapie: ${indicator.name}`}
                >
                  Otwórz na mapie
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
