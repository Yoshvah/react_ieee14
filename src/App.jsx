import { NavLink, BrowserRouter, Routes, Route } from "react-router-dom";
import Saisie from "./pages/Saisie";
import Resultats from "./pages/Resultats";
import TestAddition from "./TestAddition";
// import Graphique from "./pages/Graphique";
// Lien de navigation réutilisable
function LienNav({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "text-white bg-blue-600 shadow-sm shadow-blue-600/30"
            : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

// Composant principal
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-800 flex flex-col">

        {/* Barre de navigation sticky */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/70">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

            {/* Logo + nom */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div className="leading-tight">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  GridFACTS <span className="text-blue-600">Studio</span>
                </h1>
                <p className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  IEEE 14 — Load Flow
                </p>
              </div>
            </div>

            {/* Liens */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <LienNav to="/">Saisie</LienNav>
              <LienNav to="/resultats">Résultats</LienNav>
              {/* <LienNav to="/graphique">Graphique</LienNav> */}
              <LienNav to="/test">Test</LienNav>
            </div>

            {/* Badge statut (desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              API connectée
            </div>
          </nav>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Saisie />} />
            <Route path="/resultats" element={<Resultats />} />
            {/* <Route path="/Graphique" element={<Graphique />} /> */}
            <Route path="/test" element={<TestAddition />} />
          </Routes>
        </main>

        {/* Footer discret */}
        <footer className="border-t border-slate-200/70 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>© 2026 GridFACTS Studio — IEEE 14 bus system</p>
            <p>
              Front <span className="text-blue-600 font-medium">React</span>
              {" · "}
              Back <span className="text-emerald-600 font-medium">FastAPI</span>
            </p>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}