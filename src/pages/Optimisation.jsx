import { useState } from "react";
import { DONNEES_IEEE14 } from "../data/ieee14";

export default function Optimisation({ form }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  // const [openStep, setOpenStep] = useState(null);

  // Extraction des données (identique à ton code actuel)
  const extraireDonnees = () => {
    const buses = [];
    const branches = [];
    if (!form || Object.keys(form).length === 0) {
      DONNEES_IEEE14.buses.forEach((b, i) => buses.push([i+1, b[1], (b[2] - b[3]) / 100, -b[4] / 100, b[5], b[6], b[7] || 0]));
      DONNEES_IEEE14.branches.forEach(b => branches.push([b[0], b[1], b[2], b[3], b[4], b[5]]));
      return { buses, branches };
    }
    for (let i = 1; i <= 14; i++) {
      const typeStr = form[`n${i}_type`] || "PQ";
      const typeNum = typeStr === "Slack" ? 3 : typeStr === "PV" ? 2 : 1;
      const Pg = Number(form[`n${i}_pg`] || 0) / 100;
      const Pd = Number(form[`n${i}_pd`] || 0) / 100;
      const Qd = Number(form[`n${i}_qd`] || 0) / 100;
      const V = Number(form[`n${i}_v`] || 1.0);
      const bsh = Number(form[`n${i}_bsh`] || 0);
      buses.push([i, typeNum, Pg - Pd, -Qd, V, 0, bsh]);
    }
    for (let i = 1; i <= 20; i++) {
      if (form[`b${i}_dep`] && form[`b${i}_arr`]) {
        branches.push([
          Number(form[`b${i}_dep`]), Number(form[`b${i}_arr`]),
          Number(form[`b${i}_r`] || 0), Number(form[`b${i}_x`] || 0.01),
          Number(form[`b${i}_b`] || 0), Number(form[`b${i}_tap`] || 0)
        ]);
      }
    }
    return { buses, branches };
  };

  const lancerOptimisation = async () => {
    setLoading(true); setError(null); setResults(null);
    try {
      const body = extraireDonnees();
      const reponse = await fetch("http://127.0.0.1:8000/api/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!reponse.ok) {
        const errData = await reponse.json();
        throw new Error(errData.detail || "Erreur d'optimisation");
      }
      setResults(await reponse.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Formater proprement le nom des clés renvoyées par comparison.py
  const formatLabel = (key) => {
    if (key === "V_min") return "Tension minimale";
    if (key === "V_max") return "Tension maximale";
    if (key === "P_losses") return "Pertes actives";
    return key;
  };

  // Déterminer si la variation est une amélioration (vert) ou une dégradation (rouge)
  const isImprovement = (key, difference) => {
    if (key === "P_losses") return difference < 0; // Moins de pertes = mieux
    if (key === "V_min") return difference > 0;    // Tension qui remonte vers 1.0 = mieux
    if (key === "V_max") return difference < 0;    // Tension qui baisse vers 1.0 = mieux
    return false;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* En-tête */}
      <header className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Optimisation des Dispositifs</h1>
          <p className="text-sm text-slate-500 mt-1">Détermination des emplacements et réglages optimaux (PSO).</p>
        </div>
      </header>

      {/* Panneau de lancement */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-semibold text-slate-800 text-sm">Analyse heuristique</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">Recherche du bus optimal et de la susceptance pour un SVC, visant à minimiser les pertes et les écarts de tension.</p>
        </div>
        <button onClick={lancerOptimisation} disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-semibold text-sm shadow transition-colors disabled:opacity-50 shrink-0">
          {loading ? "Traitement en cours..." : "Exécuter l'optimisation"}
        </button>
      </div>

      {error && <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg text-sm">{error}</div>}

      {/* Affichage des résultats */}
      {results && results.best_details && results.comparison && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 1. Résumé de l'optimisation */}
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold">✓</span>
              <h3 className="font-bold text-emerald-800 text-lg">Configuration optimale identifiée</h3>
            </div>
            <p className="text-sm text-emerald-700 ml-11">
              Le SVC a été placé sur le <strong>Bus {results.best_details.bus_svc}</strong> avec une susceptance de <strong>{results.best_details.b_svc} p.u.</strong>
            </p>
          </div>

          {/* 2. Tableau comparatif (Avant / Après) */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 font-semibold text-slate-700 text-sm">
              Impact sur l'état du réseau
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold">Indicateur</th>
                  <th className="p-4 font-semibold text-center">Avant FACTS</th>
                  <th className="p-4 font-semibold text-center">Après PSO</th>
                  <th className="p-4 font-semibold text-center">Variation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(results.comparison).map(([key, data]) => {
                  const improvement = isImprovement(key, data.difference);
                  
                  // Définition des unités
                  let unit = "";
                  if (key.startsWith("V_")) unit = " p.u.";
                  if (key === "P_losses") unit = " MW";

                  return (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-800">{formatLabel(key)}</td>
                      <td className="p-4 font-mono text-center text-slate-600">{data.before}{unit}</td>
                      <td className="p-4 font-mono text-center font-bold text-blue-700">{data.after}{unit}</td>
                      <td className={`p-4 font-mono text-center text-xs font-bold ${improvement ? "text-emerald-600" : "text-red-500"}`}>
                        {data.change_percent !== null ? (
                          <>
                            {data.change_percent > 0 ? "+" : ""}
                            {data.change_percent.toFixed(1)} %
                          </>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 3. Graphique de convergence */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-slate-700 text-sm mb-4">Courbe de convergence</h3>
            <div className="relative">
              <svg viewBox="0 0 800 300" className="w-full h-64 overflow-visible">
                {[0, 1, 2, 3, 4].map(i => (
                  <g key={`h${i}`}>
                    <line x1="40" y1={30 + i * 60} x2="780" y2={30 + i * 60} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="35" y={34 + i * 60} textAnchor="end" fontSize="10" fill="#94a3b8">{(5-i)*25}%</text>
                  </g>
                ))}
                <line x1="40" y1="30" x2="40" y2="270" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="40" y1="270" x2="780" y2="270" stroke="#cbd5e1" strokeWidth="1" />
                <polyline 
                  points={results.history.filter(h => h.best_score !== null).map((h, i, arr) => {
                    const x = 40 + (i / Math.max(1, arr.length - 1)) * 740;
                    const maxScore = arr[0]?.best_score || 1;
                    const minScore = arr[arr.length-1]?.best_score || 0;
                    const ratio = (h.best_score - minScore) / (maxScore - minScore || 1);
                    const y = 30 + ratio * 240; 
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none" stroke="#3b82f6" strokeWidth="2" 
                />
              </svg>
            </div>
          </div>

          {/* 4. Historique des itérations */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 font-semibold text-slate-700 text-sm">
              Historique des itérations
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {results.history.filter(h => h.best_details).map((step, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <span className="font-medium text-slate-600 text-sm">Itération {step.iteration}</span>
                  <span className="font-mono text-slate-800 font-bold text-sm bg-slate-100 px-2 py-1 rounded">
                    Bus {step.best_details.bus_svc} · B = {step.best_details.b_svc} p.u.
                  </span>
                  <span className="font-mono text-blue-600 font-bold text-sm">
                    Objectif : {step.best_score}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}