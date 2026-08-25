interface MatchedItemsProps {
  maladies?: string[];
  examens?: string[];
  plateaux?: string[];
  compact?: boolean;
}

export default function MatchedItems({
  maladies = [],
  examens = [],
  plateaux = [],
  compact = false,
}: MatchedItemsProps) {
  const hasMatches = maladies.length > 0 || examens.length > 0 || plateaux.length > 0;

  if (!hasMatches) return null;

  return (
    <div className={`${compact ? "pt-1" : "pt-2 border-t border-slate-200 dark:border-slate-700"}`}>
      <p className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-slate-600 dark:text-slate-400 mb-1.5`}>
        Correspond à votre recherche :
      </p>
      <div className="flex flex-wrap gap-1">
        {maladies.map((maladie, idx) => (
          <span
            key={`m-${idx}`}
            className={`${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"} bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded`}
          >
            {maladie}
          </span>
        ))}
        {examens.map((examen, idx) => (
          <span
            key={`e-${idx}`}
            className={`${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"} bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded`}
          >
            {examen}
          </span>
        ))}
        {plateaux.map((plateau, idx) => (
          <span
            key={`p-${idx}`}
            className={`${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"} bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded`}
          >
            {plateau}
          </span>
        ))}
      </div>
    </div>
  );
}
