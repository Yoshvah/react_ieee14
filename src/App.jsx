import { useState } from "react";
import Saisie from "./pages/Saisie";
import Resultats from "./pages/Resultats";
import Etapes from "./pages/Etapes";
import Stabilite from "./pages/Stabilite";
import Schema from "./pages/Schema";

export default function App() {
  const [loading, setLoading] = useState(false);
  
  // ============================================================
  // ÉTATS POUR LES RÉSULTATS ET DISPOSITIFS
  // ============================================================
  const [resultats, setResultats] = useState(null);
  const [history, setHistory] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [ybusData, setYbusData] = useState(null);
  const [branchFlows, setBranchFlows] = useState(null);
  const [stabilityData, setStabilityData] = useState(null);
  
  const [activeFacts, setActiveFacts] = useState([]); 
  const [activeSolars, setActiveSolars] = useState([]); 
  const [currentNetwork, setCurrentNetwork] = useState(null); 

  // ============================================================
  // ÉTATS PERSISTANTS DU FORMULAIRE SAISIE
  // ============================================================
  const [form, setForm] = useState({});
  const [faultBus, setFaultBus] = useState(2);

  // ============================================================
  // NAVIGATION
  // ============================================================
  const [page, setPage] = useState("saisie");

  // ============================================================
  // LANCEMENT DU LOAD FLOW
  // ============================================================
  const lancerSimulation = async (buses, branches, facts, solars) => {
    // 🔒 Blindage : si null/undefined, on remplace par un tableau vide
    const safeFacts  = Array.isArray(facts)  ? facts  : [];
    const safeSolars = Array.isArray(solars) ? solars : [];

    setErreur(null);
    setLoading(true);
    setPage("resultats");
    setCurrentNetwork({ buses, branches }); 

    try {
      const body = { buses, branches };
      if (safeFacts.length > 0)  body.facts  = safeFacts;
      if (safeSolars.length > 0) body.solars = safeSolars;

      const reponse = await fetch("http://127.0.0.1:8000/api/loadflow", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!reponse.ok) {
        const errData = await reponse.json();
        throw new Error(errData.detail || "Erreur lors du calcul Load Flow");
      }

      const data = await reponse.json();
      
      if (!data || !data.results) {
        throw new Error("Le serveur n'a pas renvoyé de résultats valides.");
      }

      setResultats(data.results);
      setHistory(data.history);
      setYbusData(data.ybus);
      setBranchFlows(data.branch_flows || []);
      
      setActiveFacts(safeFacts);
      setActiveSolars(safeSolars);
      
    } catch (err) {
      console.error(err);
      setErreur(err.message);
      setResultats(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // APPLICATION DES DISPOSITIFS (depuis l'onglet Résultats)
  // ============================================================
  const appliquerDispositifs = (facts, solars) => {
    if (currentNetwork) {
      lancerSimulation(currentNetwork.buses, currentNetwork.branches, facts, solars);
    }
  };

  // ============================================================
  // LANCEMENT DE LA STABILITÉ
  // ============================================================
  const lancerStabilite = async (buses, branches, faultBus) => {
    setStabilityData(null);
    setLoading(true);
    setPage("stabilite");

    try {
      const reponse = await fetch("http://127.0.0.1:8000/api/stability", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buses, branches, fault_bus: faultBus, duration: 5.0 }),
      });

      if (!reponse.ok) {
        const errData = await reponse.json();
        throw new Error(errData.detail || "Erreur lors du calcul de stabilité");
      }

      const data = await reponse.json();
      setStabilityData(data);
    } catch (err) {
      console.error(err);
      alert("Erreur de stabilité : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RÉINITIALISATION
  // ============================================================
  const reinitialiserDonnees = () => {
    if (window.confirm("Voulez-vous vraiment effacer toutes les données calculées ?")) {
      setResultats(null); setHistory(null); setYbusData(null);
      setBranchFlows(null); setStabilityData(null); 
      setActiveFacts([]); setActiveSolars([]); 
      setCurrentNetwork(null); 
      setErreur(null); setPage("saisie");
      // Optionnel : setForm({}) pour vider aussi le formulaire
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
          {["saisie", "schema", "resultats", "etapes", "stabilite"].map(p => (
            <button 
              key={p} 
              onClick={() => setPage(p)} 
              className={page === p ? "font-semibold text-blue-600 capitalize" : "text-slate-500 hover:text-slate-800 transition capitalize"}
            >
              {p === "schema" ? "Schéma" : p === "etapes" ? "Étapes" : p}
            </button>
          ))}
        </div>

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
        {page === "saisie" && (
          <Saisie 
            form={form} 
            setForm={setForm} 
            faultBus={faultBus} 
            setFaultBus={setFaultBus} 
            onCalculer={lancerSimulation} 
            onStabilite={lancerStabilite} 
          />
        )}
        
        {page === "schema" && (
          <Schema 
            resultats={resultats} 
            facts={activeFacts} 
            solars={activeSolars} 
          />
        )}
        
        {page === "resultats" && (
          <Resultats 
            resultats={resultats} 
            erreur={erreur} 
            branchFlows={branchFlows} 
            loading={loading} 
            onApplyDispositifs={appliquerDispositifs}
            activeFacts={activeFacts}
            activeSolars={activeSolars}
          />
        )}
        
        {page === "etapes" && (
          <Etapes 
            history={history} 
            ybusData={ybusData} 
            branchFlows={branchFlows} 
          />
        )}
        
        {page === "stabilite" && (
          <Stabilite data={stabilityData} />
        )}
      </main>
    </div>
  );
}