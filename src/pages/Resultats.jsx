export default function Resultats({ resultats, erreur, branchFlows, loading }) {
  // 1. État de chargement (Spinner)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-blue-600 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-semibold text-lg">Calcul de Newton-Raphson en cours...</p>
        <p className="text-sm text-slate-500 mt-2">Résolution des équations du réseau</p>
      </div>
    );
  }

  // 2. Gestion des erreurs
  if (erreur) {
    return (
      <div className="p-10 text-red-600 bg-red-50 border border-red-200 rounded-lg m-6 max-w-4xl mx-auto shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-200 text-red-700 font-bold">!</span>
          <h2 className="text-lg font-bold">Erreur de calcul</h2>
        </div>
        <p className="font-mono text-sm bg-white p-3 rounded border border-red-100">{erreur}</p>
        <p className="text-sm mt-4 text-red-500">
          Vérifiez que le backend Python est bien lancé (<code>uvicorn main:app --reload</code>) et que les données saisies sont valides.
        </p>
      </div>
    );
  }

  // 3. Aucun résultat
  if (!resultats) {
    return (
      <div className="p-10 text-slate-500 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <div className="text-4xl mb-4">⚡</div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Aucune simulation</h2>
        <p>Remplissez les données dans l'onglet Saisie et lancez le Load Flow.</p>
      </div>
    );
  }

  // 4. Affichage des résultats
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* Bandeau de succès */}
      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-200 text-green-700 font-bold">✓</span>
          <span className="font-semibold text-lg">Convergence atteinte</span>
        </div>
        <span className="text-sm font-medium bg-green-100 px-3 py-1 rounded-full">
          Méthode : Newton-Raphson
        </span>
      </div>

      {/* ==================================================== */}
      {/* TABLEAU 1 : BILAN DE PUISSANCE AUX NŒUDS             */}
      {/* ==================================================== */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4">1. Bilan de Puissance aux Nœuds</h2>
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <table className="w-full text-sm text-center">
            <thead className="bg-slate-100 font-semibold text-slate-700">
              <tr>
                <th className="p-3 border-b">Bus</th>
                <th className="p-3 border-b">Tension V (p.u.)</th>
                <th className="p-3 border-b">Angle θ (°)</th>
                <th className="p-3 border-b">P injecté (MW)</th>
                <th className="p-3 border-b">Q injecté (MVAr)</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((r) => (
                <tr key={r.bus} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2 border-b font-bold text-slate-600">{r.bus}</td>
                  <td className="p-2 border-b font-mono text-blue-700">{r.V.toFixed(4)}</td>
                  <td className="p-2 border-b font-mono text-slate-600">{r.theta.toFixed(2)}</td>
                  <td className={`p-2 border-b font-mono font-semibold ${r.P_MW > 0 ? "text-emerald-600" : "text-slate-600"}`}>
                    {r.P_MW.toFixed(2)}
                  </td>
                  <td className={`p-2 border-b font-mono font-semibold ${r.Q_MVAr > 0 ? "text-amber-500" : "text-slate-600"}`}>
                    {r.Q_MVAr.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ==================================================== */}
      {/* TABLEAU 2 : FLUX ET PERTES DANS LES LIGNES           */}
      {/* ==================================================== */}
      {branchFlows && branchFlows.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">2. Transits et Pertes de Lignes</h2>
          <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
            <table className="w-full text-sm text-center">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="p-3 border-b">Ligne</th>
                  <th className="p-3 border-b text-blue-600">P Départ (MW)</th>
                  <th className="p-3 border-b text-blue-600">Q Départ (MVAr)</th>
                  <th className="p-3 border-b text-blue-600">P Arrivée (MW)</th>
                  <th className="p-3 border-b text-blue-600">Q Arrivée (MVAr)</th>
                  <th className="p-3 border-b text-red-600">Pertes (MW)</th>
                </tr>
              </thead>
              <tbody>
                {branchFlows.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 border-b font-bold text-slate-600">{f.from} → {f.to}</td>
                    <td className="p-2 border-b font-mono">{f.p_from_MW.toFixed(2)}</td>
                    <td className="p-2 border-b font-mono">{f.q_from_MVAr.toFixed(2)}</td>
                    <td className="p-2 border-b font-mono">{f.p_to_MW.toFixed(2)}</td>
                    <td className="p-2 border-b font-mono">{f.q_to_MVAr.toFixed(2)}</td>
                    <td className="p-2 border-b font-mono font-bold text-red-600 bg-red-50">
                      {f.loss_MW.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}