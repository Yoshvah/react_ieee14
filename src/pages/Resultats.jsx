import { useState } from "react";

export default function Resultats({ 
  resultats, erreur, branchFlows, loading, 
  onApplyDispositifs, activeFacts, activeSolars 
}) {
  // Initialisation de l'état local avec les valeurs déjà appliquées
  const [modifs, setModifs] = useState(() => {
    const initial = {};
    if (Array.isArray(activeFacts)) {
      activeFacts.forEach(f => {
        if (f.bus_id) {
          if (!initial[f.bus_id]) initial[f.bus_id] = {};
          initial[f.bus_id].type = f.type;
          initial[f.bus_id].param1 = f.param1;
          initial[f.bus_id].param2 = f.param2;
        }
      });
    }
    if (Array.isArray(activeSolars)) {
      activeSolars.forEach(s => {
        if (!initial[s.bus_id]) initial[s.bus_id] = {};
        initial[s.bus_id].solarP = s.active_power;
      });
    }
    return initial;
  });

  // 1. Spinner de chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-blue-600 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-semibold text-lg">Calcul de Newton-Raphson en cours...</p>
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
      </div>
    );
  }

  // 3. Aucun résultat
  if (!resultats || !Array.isArray(resultats) || resultats.length === 0) {
    return (
      <div className="p-10 text-slate-500 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <div className="text-4xl mb-4">⚡</div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Aucune donnée de résultat</h2>
        <p>Lancez un Load Flow depuis l'onglet Saisie pour afficher les données.</p>
      </div>
    );
  }

  // Gestion du changement de valeur
  const handleModif = (busId, field, value) => {
    setModifs(prev => ({
      ...prev,
      [busId]: {
        ...prev[busId],
        [field]: value === "" ? null : (isNaN(value) ? value : Number(value))
      }
    }));
  };

  // Soumission globale
  const handleApplyAll = () => {
    const facts = [];
    const solars = [];

    Object.keys(modifs).forEach(busId => {
      const m = modifs[busId];
      if (m.type && m.param1 !== null && m.param1 !== undefined) {
        if (m.type === "TCSC" && m.targetBranch !== undefined && m.targetBranch !== null) {
          // Pour le TCSC, on envoie branch_index et on n'a pas besoin de bus_id
          facts.push({ 
            branch_index: Number(m.targetBranch), 
            type: "TCSC", 
            param1: Number(m.param1) 
          });
        } else if (m.type !== "TCSC") {
          // Pour les autres, on envoie bus_id
          facts.push({ 
            bus_id: Number(busId), 
            type: m.type, 
            param1: Number(m.param1), 
            param2: m.param2 !== null && m.param2 !== undefined ? Number(m.param2) : null 
          });
        }
      }
      if (m.solarP) {
        solars.push({ bus_id: Number(busId), active_power: Number(m.solarP) });
      }
    });

    onApplyDispositifs(facts, solars);
    // On ne vide pas les modifs pour qu'elles restent affichées
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 space-y-6">
      
      {/* Bandeau de succès + Bouton */}
      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-200 text-green-700 font-bold">✓</span>
          <span className="font-semibold text-lg">Convergence atteinte</span>
        </div>
        <button onClick={handleApplyAll} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors flex items-center gap-2">
          <span>⚙️</span> Appliquer les modifications
        </button>
      </div>

      {/* TABLEAU UNIFIÉ */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Bilan de Puissance et Contrôle des Dispositifs</h2>
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <table className="w-full text-sm text-center">
            <thead className="bg-slate-100 font-semibold text-slate-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 border-b" rowSpan={2}>Bus</th>
                <th className="p-3 border-b" rowSpan={2}>V (pu)</th>
                <th className="p-3 border-b" rowSpan={2}>θ (°)</th>
                <th className="p-3 border-b" rowSpan={2}>P (MW)</th>
                <th className="p-3 border-b" rowSpan={2}>Q (MVAr)</th>
                <th className="p-2 border-b border-l border-slate-300 text-emerald-700" colSpan={4}>Dispositif FACTS</th>
                <th className="p-2 border-b border-l border-slate-300 text-amber-700" colSpan={2}>Solaire</th>
              </tr>
              <tr>
                <th className="p-2 border-b border-l border-slate-300 bg-emerald-50/50 text-xs">Type</th>
                <th className="p-2 border-b bg-emerald-50/50 text-xs">Param 1</th>
                <th className="p-2 border-b bg-emerald-50/50 text-xs">Param 2</th>
                <th className="p-2 border-b bg-emerald-50/50 text-xs">Ligne (TCSC)</th>
                <th className="p-2 border-b border-l border-slate-300 bg-amber-50/50 text-xs">P (MW)</th>
                <th className="p-2 border-b bg-amber-50/50 text-xs">Statut</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((r) => {
                const m = modifs[r.bus] || {};
                const isSolarActive = activeSolars?.some(s => s.bus_id === r.bus);
                const isFactActive = activeFacts?.some(f => f.bus_id === r.bus || (f.type === "TCSC" && f.branch_index !== undefined));

                let param1Label = "—";
                if (m.type === "SVC") param1Label = "B (pu)";
                if (m.type === "STATCOM") param1Label = "Q (MVAr)";
                if (m.type === "TCSC") param1Label = "% Comp";
                if (m.type === "UPFC") param1Label = "P (MW)";

                return (
                  <tr key={r.bus} className="hover:bg-slate-50 transition-colors border-b">
                    <td className="p-2 font-bold text-slate-600">{r.bus}</td>
                    <td className="p-2 font-mono text-blue-700 font-bold">{Number(r.V).toFixed(4)}</td>
                    <td className="p-2 font-mono text-slate-600">{Number(r.theta).toFixed(2)}</td>
                    <td className={`p-2 font-mono font-semibold ${r.P_MW > 0 ? "text-emerald-600" : "text-slate-600"}`}>
                      {Number(r.P_MW).toFixed(2)}
                    </td>
                    <td className={`p-2 font-mono font-semibold ${r.Q_MVAr > 0 ? "text-amber-500" : "text-slate-600"}`}>
                      {Number(r.Q_MVAr).toFixed(2)}
                    </td>

                    {/* Colonnes FACTS */}
                    <td className="p-2 border-l border-slate-200 bg-emerald-50/20">
                      <select 
                        value={m.type ?? ""} 
                        onChange={(e) => handleModif(r.bus, 'type', e.target.value)} 
                        className="rounded border-slate-300 p-1 text-xs w-24 bg-white"
                      >
                        <option value="">Aucun</option>
                        <option value="SVC">SVC</option>
                        <option value="STATCOM">STATCOM</option>
                        <option value="TCSC">TCSC</option>
                        <option value="UPFC">UPFC</option>
                      </select>
                    </td>
                    <td className="p-2 bg-emerald-50/20">
                      <input 
                        type="number" step="any" placeholder={param1Label} 
                        value={m.param1 ?? ""} onChange={(e) => handleModif(r.bus, 'param1', e.target.value)}
                        disabled={!m.type}
                        className="w-16 p-1 border rounded text-xs text-center bg-white disabled:bg-slate-100" 
                      />
                    </td>
                    <td className="p-2 bg-emerald-50/20">
                      {m.type === 'UPFC' && (
                        <input type="number" step="1" placeholder="Q (MVAr)" value={m.param2 ?? ""} onChange={(e) => handleModif(r.bus, 'param2', e.target.value)} className="w-16 p-1 border rounded text-xs text-center bg-white" />
                      )}
                      {m.type !== 'UPFC' && <span className="text-slate-300 text-xs">—</span>}
                    </td>

                    {/* Nouvelle colonne pour le choix de la LIGNE (TCSC) */}
                    <td className="p-2 bg-emerald-50/20">
                      {m.type === 'TCSC' && branchFlows ? (
                        <select 
                          value={m.targetBranch ?? ""} 
                          onChange={(e) => handleModif(r.bus, 'targetBranch', e.target.value)} 
                          className="rounded border-slate-300 p-1 text-xs w-28 bg-white"
                        >
                          <option value="">Choisir...</option>
                          {branchFlows.map((b, i) => (
                            <option key={i} value={i}>Ligne {b.from}-{b.to}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Colonnes SOLAIRE */}
                    <td className="p-2 border-l border-slate-200 bg-amber-50/20">
                      <input type="number" step="1" placeholder="0" value={m.solarP ?? ""} onChange={(e) => handleModif(r.bus, 'solarP', e.target.value)} className="w-20 p-1 border rounded text-xs text-center bg-white" />
                    </td>
                    <td className="p-2 bg-amber-50/20 text-xs font-semibold">
                      {isFactActive && <div className="text-emerald-600">FACTS Actif</div>}
                      {isSolarActive && <div className="text-amber-600">PV Actif</div>}
                      {!isFactActive && !isSolarActive && <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* TABLEAU 2 : FLUX ET PERTES */}
      {branchFlows && Array.isArray(branchFlows) && branchFlows.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Transits et Pertes de Lignes</h2>
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
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 border-b font-bold text-slate-600">{f.from} → {f.to}</td>
                    <td className="p-2 border-b font-mono">{Number(f.p_from_MW).toFixed(2)}</td>
                    <td className="p-2 border-b font-mono">{Number(f.q_from_MVAr).toFixed(2)}</td>
                    <td className="p-2 border-b font-mono">{Number(f.p_to_MW).toFixed(2)}</td>
                    <td className="p-2 border-b font-mono">{Number(f.q_to_MVAr).toFixed(2)}</td>
                    <td className="p-2 border-b font-mono font-bold text-red-600 bg-red-50">{Number(f.loss_MW).toFixed(3)}</td>
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