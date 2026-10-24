import { useState } from "react";
import Saisie from "./pages/Saisie";
import Resultats from "./pages/Resultats";
import Etapes from "./pages/Etapes";
import Stabilite from "./pages/Stabilite";
import Schema from "./pages/Schema";

export default function App() {
  const [loading, setLoading] = useState(false);

  // --- États persistants (ils gardent leur valeur entre les onglets) ---
  const [resultats, setResultats] = useState(null);
  const [history, setHistory] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [ybusData, setYbusData] = useState(null);
  const [branchFlows, setBranchFlows] = useState(null);
  const [stabilityData, setStabilityData] = useState(null);

  // --- Navigation ---
  const [page, setPage] = useState("saisie");

  // ============================================================
  // LANCEMENT DU LOAD FLOW
  // ============================================================
  const lancerSimulation = async (buses, branches) => {
    // ON NE VIDE PLUS : setResultats(null), setHistory(null), etc.
    // On efface juste l'erreur précédente
    setErreur(null);
    setLoading(true);
    setPage("resultats"); // On va sur l'onglet résultats pour voir le spinner

    try {
      const reponse = await fetch("http://127.0.0.1:8000/api/loadflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buses, branches }),
      });

      if (!reponse.ok) {
        const errData = await reponse.json();
        throw new Error(errData.detail || "Erreur lors du calcul Load Flow");
      }

      const data = await reponse.json();
      
      // On écrase avec les nouveaux résultats seulement si succès
      setResultats(data.results);
      setHistory(data.history);
      setYbusData(data.ybus);
      setBranchFlows(data.branch_flows);
      
      setLoading(false);
    } catch (err) {
      setErreur(err.message);
      // On garde les anciens resultats/history en cas d'erreur !
      setLoading(false);
    }
  };

  // ============================================================
  // LANCEMENT DE LA STABILITÉ
  // ============================================================
  const lancerStabilite = async (buses, branches, faultBus) => {
    setLoading(true);
    setPage("stabilite");

    try {
      const reponse = await fetch("http://127.0.0.1:8000/api/stability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buses, branches, fault_bus: faultBus, duration: 5.0 }),
      });

      if (!reponse.ok) {
        const errData = await reponse.json();
        throw new Error(errData.detail || "Erreur de stabilité");
      }

      const data = await reponse.json();
      setStabilityData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Erreur de stabilité : " + err.message);
      setLoading(false);
    }
  };

  // ============================================================
  // BOUTON DE RÉINITIALISATION MANUELLE
  // ============================================================
  const reinitialiserDonnees = () => {
    if (window.confirm("Voulez-vous vraiment effacer toutes les données calculées ?")) {
      setResultats(null);
      setHistory(null);
      setYbusData(null);
      setBranchFlows(null);
      setStabilityData(null);
      setErreur(null);
      setPage("saisie");
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center gap-8 shadow-sm">
        <h1 className="text-xl font-bold text-blue-700 tracking-tight">SPARK-Flow</h1>
        
        <div className="flex gap-6 flex-1">
          <button onClick={() => setPage("saisie")} className={page === "saisie" ? "font-semibold text-blue-600" : "text-slate-500 hover:text-slate-800 transition"}>Saisie</button>
          <button onClick={() => setPage("schema")} className={page === "schema" ? "font-semibold text-blue-600" : "text-slate-500 hover:text-slate-800 transition"}>Schéma Réseau</button>
          <button onClick={() => setPage("resultats")} className={page === "resultats" ? "font-semibold text-blue-600" : "text-slate-500 hover:text-slate-800 transition"}>Résultats</button>
          <button onClick={() => setPage("etapes")} className={page === "etapes" ? "font-semibold text-blue-600" : "text-slate-500 hover:text-slate-800 transition"}>Étapes</button>
          <button onClick={() => setPage("stabilite")} className={page === "stabilite" ? "font-semibold text-blue-600" : "text-slate-500 hover:text-slate-800 transition"}>Stabilité</button>
        </div>

        {/* BOUTON DE RESET */}
        {(resultats || stabilityData) && (
          <button 
            onClick={reinitialiserDonnees}
            className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md font-semibold transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </nav>

      <main className="p-6">
        {page === "saisie" && <Saisie onCalculer={lancerSimulation} onStabilite={lancerStabilite} />}
        {page === "schema" && <Schema resultats={resultats} />}
        {page === "resultats" && <Resultats resultats={resultats} erreur={erreur} branchFlows={branchFlows} loading={loading} />}
        {page === "etapes" && <Etapes history={history} ybusData={ybusData} branchFlows={branchFlows} />}
        {page === "stabilite" && <Stabilite data={stabilityData} />}
      </main>
    </div>
  );
}