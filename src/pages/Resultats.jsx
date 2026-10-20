// Nombre de nœuds du réseau IEEE 14
const NB_NOEUDS = 14;

// Composant carte réutilisable (cohérent avec les autres pages)
function Carte({ titre, sousTitre, badge, children }) {
  return (
    <section className="mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
              {titre}
            </h2>
            {sousTitre && (
              <p className="text-xs text-slate-500 truncate">{sousTitre}</p>
            )}
          </div>
        </div>
        {badge && (
          <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {badge}
          </span>
        )}
      </header>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

// Page d'affichage des résultats
export default function Resultats() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* En-tête de page */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Répartition de puissance
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Résultats <span className="text-blue-600">IEEE 14</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Valeurs calculées aux nœuds après convergence du load-flow.
        </p>
      </div>

      {/* Bandeau d'état vide */}
      <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/40 p-4 sm:p-5 flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <span className="text-amber-600 text-lg">⏳</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            Aucun calcul exécuté
          </p>
          <p className="text-xs text-amber-800/80 mt-0.5">
            Les résultats s'afficheront après l'intégration du calcul de répartition de puissance (Newton-Raphson).
          </p>
        </div>
      </div>

      {/* Statistiques résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
        {[
          { label: "Itérations", value: "—", color: "text-blue-600" },
          { label: "Convergence", value: "—", color: "text-emerald-600" },
          { label: "P pertes (p.u.)", value: "—", color: "text-indigo-600" },
          { label: "Q pertes (p.u.)", value: "—", color: "text-amber-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4"
          >
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {s.label}
            </p>
            <p className={`mt-1 text-lg sm:text-xl font-bold ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Carte : valeurs aux nœuds */}
      <Carte
        titre="Valeurs aux nœuds"
        sousTitre="Tensions et puissances injectées"
        badge={`${NB_NOEUDS} bus`}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[600px] border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["Nœud", "P (p.u.)", "Q (p.u.)", "V (p.u.)", "θ (°)"].map((c) => (
                  <th
                    key={c}
                    className="border-b border-slate-200 px-3 py-2.5 font-semibold text-slate-600 text-center whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: NB_NOEUDS }, (_, i) => (
                <tr
                  key={i}
                  className={`transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  } hover:bg-blue-50/60`}
                >
                  <td className="border-b border-slate-100 px-3 py-2 text-center font-medium text-slate-500">
                    {i + 1}
                  </td>
                  {Array.from({ length: 4 }, (_, j) => (
                    <td
                      key={j}
                      className="border-b border-slate-100 px-3 py-2 text-center text-slate-300"
                    >
                      —
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Carte>
    </div>
  );
}