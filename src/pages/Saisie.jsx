import { useState } from "react";

// ============================================================
// DONNÉES DE RÉFÉRENCE : Réseau IEEE 14-Bus (MATPOWER)
// ============================================================
const DONNEES_IEEE14 = {
  buses: [
    [1, 3, 0, 0, 1.06, 0],
    [2, 2, 18.3, 0, 1.045, 0],
    [3, 2, -94.2, 0, 1.01, 0],
    [4, 1, -47.8, 3.9, 1.0, 0],
    [5, 1, -7.6, -1.6, 1.0, 0],
    [6, 2, -11.2, 0, 1.07, 0],
    [7, 1, 0, 0, 1.0, 0],
    [8, 2, 0, 0, 1.09, 0],
    [9, 1, -29.5, -16.6, 1.0, 0],
    [10, 1, -9.0, -5.8, 1.0, 0],
    [11, 1, -3.5, -1.8, 1.0, 0],
    [12, 1, -6.1, -1.6, 1.0, 0],
    [13, 1, -13.5, -1.8, 1.0, 0],
    [14, 1, -14.9, -5.0, 1.0, 0]
  ],
  branches: [
    [1, 2, 0.01938, 0.05917], [1, 5, 0.05403, 0.22304],
    [2, 3, 0.04699, 0.19797], [2, 4, 0.05811, 0.17632],
    [2, 5, 0.05695, 0.17388], [3, 4, 0.06701, 0.17103],
    [4, 5, 0.01335, 0.04211], [4, 7, 0.0, 0.20912],
    [4, 9, 0.0, 0.55618], [5, 6, 0.0, 0.25202],
    [6, 11, 0.09498, 0.19890], [6, 12, 0.12291, 0.25581],
    [6, 13, 0.06615, 0.13027], [7, 8, 0.0, 0.17615],
    [7, 9, 0.0, 0.11001], [9, 10, 0.03181, 0.08450],
    [9, 14, 0.12711, 0.27038], [10, 11, 0.08205, 0.19207],
    [12, 13, 0.22092, 0.19988], [13, 14, 0.17093, 0.34802]
  ]
};

const getTypeString = (typeNum) => {
  if (typeNum === 3) return "Slack";
  if (typeNum === 2) return "PV";
  return "PQ";
};

// ============================================================
// STYLES RÉUTILISABLES (Tailwind)
// ============================================================
const inputStyle = "w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";
const selectStyle = "w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs focus:border-blue-500 cursor-pointer";
const thStyle = "border-b border-slate-300 p-2 text-xs font-semibold text-slate-700 bg-slate-100";
const tdStyle = "p-1 border-b border-slate-100";

// Règles de modification selon le type de bus
const reglesModification = {
  Slack: ["V", "theta"],
  PV: ["P", "V"],
  PQ: ["P", "Q"],
};

// ============================================================
// COMPOSANT PRINCIPAL : SAISIE
// ============================================================
export default function Saisie({ onCalculer, onStabilite }) {
  const [form, setForm] = useState({});
  const [faultBus, setFaultBus] = useState(2);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isEditable = (typeBus, champ) => {
    return reglesModification[typeBus]?.includes(champ) ?? false;
  };

  const chargerTestStandard = () => {
    const newForm = {};
    DONNEES_IEEE14.buses.forEach((bus, i) => {
      const idx = i + 1;
      const [, typeNum, P, Q, V, theta] = bus;
      newForm[`n${idx}_type`] = getTypeString(typeNum);
      newForm[`n${idx}_p`] = P;
      newForm[`n${idx}_q`] = Q;
      newForm[`n${idx}_v`] = V;
      newForm[`n${idx}_theta`] = theta;
    });
    DONNEES_IEEE14.branches.forEach((branch, i) => {
      const idx = i + 1;
      const [dep, arr, r, x] = branch;
      newForm[`b${idx}_dep`] = dep;
      newForm[`b${idx}_arr`] = arr;
      newForm[`b${idx}_r`] = r;
      newForm[`b${idx}_x`] = x;
    });
    setForm(newForm);
  };

  // ============================================================
  // PRÉPARATION DU PAYLOAD (CORRIGÉ AVEC 6 PARAMÈTRES POUR LES BRANCHES)
  // ============================================================
  const extraireDonnees = () => {
    const buses = [];
    const branches = [];

    // Extraction des nœuds
    for (let i = 1; i <= 14; i++) {
      const typeStr = form[`n${i}_type`] || "PQ";
      const typeNum = typeStr === "Slack" ? 3 : typeStr === "PV" ? 2 : 1;
      
      const P = Number(form[`n${i}_p`] || 0) / 100;
      const Q = Number(form[`n${i}_q`] || 0) / 100;
      const V = Number(form[`n${i}_v`] || 1.0);
      const theta = Number(form[`n${i}_theta`] || 0);

      buses.push([i, typeNum, P, Q, V, theta]);
    }

    // Extraction des branches (AVEC B = 0 ET TAP = 0 PAR DÉFAUT)
    for (let i = 1; i <= 20; i++) {
      if (form[`b${i}_dep`] && form[`b${i}_arr`]) {
        branches.push([
          Number(form[`b${i}_dep`]),
          Number(form[`b${i}_arr`]),
          Number(form[`b${i}_r`] || 0),
          Number(form[`b${i}_x`] || 0.01),
          0, // Susceptance Shunt (B)
          0  // Tap Ratio (0 = nominal)
        ]);
      }
    }

    return { buses, branches };
  };

  const lancerCalcul = () => {
    const { buses, branches } = extraireDonnees();
    onCalculer(buses, branches);
  };

  const lancerStabilite = () => {
    const { buses, branches } = extraireDonnees();
    onStabilite(buses, branches, Number(faultBus));
  };

  // ============================================================
  // RENDU JSX
  // ============================================================
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light text-slate-800">
            SPARK-Flow <span className="font-bold text-blue-600">Solver</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Module de saisie (Format IEEE 14-Bus)
          </p>
        </div>
        <button
          onClick={chargerTestStandard}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-emerald-700 transition"
        >
          ⚡ Charger le test IEEE 14 (Standard)
        </button>
      </header>

      <h2 className="text-lg font-semibold mb-3 text-slate-700">
        1. Paramètres des Nœuds (Buses)
      </h2>
      <p className="text-xs text-slate-500 mb-2">
        P et Q sont les puissances nettes injectées (MW/MVAr). Mettez une valeur négative pour une charge.
      </p>
      <div className="overflow-x-auto border rounded-lg mb-8 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thStyle}>Bus</th>
              <th className={thStyle}>Type</th>
              <th className={thStyle}>P (MW)</th>
              <th className={thStyle}>Q (MVAr)</th>
              <th className={thStyle}>V (p.u.)</th>
              <th className={thStyle}>θ (°)</th>
            </tr>
          </thead>
          <tbody>
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map((num) => (
              <tr key={num} className={num % 2 === 0 ? "bg-slate-50" : ""}>
                <td className="text-center font-bold text-slate-500">{num}</td>
                <td className={tdStyle}>
                  <select
                    name={`n${num}_type`}
                    value={form[`n${num}_type`] ?? ""}
                    onChange={handleChange}
                    className={selectStyle}
                  >
                    <option value="">--</option>
                    <option>Slack</option>
                    <option>PV</option>
                    <option>PQ</option>
                  </select>
                </td>
                <td className={tdStyle}>
                  <input
                    type="number"
                    name={`n${num}_p`}
                    value={form[`n${num}_p`] ?? ""}
                    onChange={handleChange}
                    disabled={!isEditable(form[`n${num}_type`], "P")}
                    className={inputStyle}
                  />
                </td>
                <td className={tdStyle}>
                  <input
                    type="number"
                    name={`n${num}_q`}
                    value={form[`n${num}_q`] ?? ""}
                    onChange={handleChange}
                    disabled={!isEditable(form[`n${num}_type`], "Q")}
                    className={inputStyle}
                  />
                </td>
                <td className={tdStyle}>
                  <input
                    type="number"
                    name={`n${num}_v`}
                    value={form[`n${num}_v`] ?? ""}
                    onChange={handleChange}
                    disabled={!isEditable(form[`n${num}_type`], "V")}
                    className={inputStyle}
                  />
                </td>
                <td className={tdStyle}>
                  <input
                    type="number"
                    name={`n${num}_theta`}
                    value={form[`n${num}_theta`] ?? ""}
                    onChange={handleChange}
                    disabled={!isEditable(form[`n${num}_type`], "theta")}
                    className={inputStyle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mb-3 text-slate-700">
        2. Lignes de Transport (Branches)
      </h2>
      <div className="overflow-x-auto border rounded-lg mb-8 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thStyle}>Bus Départ</th>
              <th className={thStyle}>Bus Arrivée</th>
              <th className={thStyle}>R (p.u.)</th>
              <th className={thStyle}>X (p.u.)</th>
            </tr>
          </thead>
          <tbody>
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((num) => (
              <tr key={num} className={num % 2 === 0 ? "bg-slate-50" : ""}>
                <td className={tdStyle}>
                  <input
                    type="number"
                    name={`b${num}_dep`}
                    value={form[`b${num}_dep`] ?? ""}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder={num === 1 ? "1" : ""}
                  />
                </td>
                <td className={tdStyle}>
                  <input
                    type="number"
                    name={`b${num}_arr`}
                    value={form[`b${num}_arr`] ?? ""}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder={num === 1 ? "2" : ""}
                  />
                </td>
                <td className={tdStyle}>
                  <input
                    type="number"
                    step="any"
                    name={`b${num}_r`}
                    value={form[`b${num}_r`] ?? ""}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder={num === 1 ? "0.019" : ""}
                  />
                </td>
                <td className={tdStyle}>
                  <input
                    type="number"
                    step="any"
                    name={`b${num}_x`}
                    value={form[`b${num}_x`] ?? ""}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder={num === 1 ? "0.059" : ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-slate-200 p-6 rounded-lg shadow-sm gap-6">
        <div className="flex items-center gap-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
          <label className="text-sm font-semibold text-purple-900">
            Bus pour le défaut (Stabilité) :
          </label>
          <input
            type="number"
            min="1"
            max="14"
            value={faultBus}
            onChange={(e) => setFaultBus(e.target.value)}
            className="w-16 rounded border border-purple-300 bg-white p-2 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={lancerStabilite}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-purple-700 transition flex items-center gap-2"
          >
            📈 Simuler Stabilité
          </button>
          
          <button
            onClick={lancerCalcul}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2"
          >
            ⚡ Lancer Load Flow
          </button>
        </div>
      </div>

    </div>
  );
}