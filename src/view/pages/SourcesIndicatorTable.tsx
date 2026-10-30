import { Link } from 'react-router';
import indicators from '../../../config/indicators.json';

export function SourcesIndicatorTable() {
  return (
    <div className="overflow-x-auto border border-linia">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-kalka border-b border-linia font-[700]">
          <tr>
            <th className="p-3">Wskaźnik</th>
            <th className="p-3">Dział</th>
            <th className="p-3">Poziom</th>
            <th className="p-3">Jednostka</th>
            <th className="p-3 text-right">bdlVarId</th>
            <th className="p-3 text-right">Akcja</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-linia font-[400]">
          {indicators.map((indicator) => (
            <tr key={indicator.id} className="hover:bg-linia/10">
              <td className="p-3 font-medium">{indicator.name}</td>
              <td className="p-3 text-olowek">{indicator.group}</td>
              <td className="p-3 text-olowek">{indicator.minLevel}</td>
              <td className="p-3 text-olowek">{indicator.unit}</td>
              <td className="p-3 text-right font-mono">{indicator.bdlVarId}</td>
              <td className="p-3 text-right">
                <Link
                  to={`/?i=${indicator.id}`}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 font-[500] hover:underline text-korekta-tekst"
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
