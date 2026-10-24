import { useState, useMemo } from "react";

const BUS_LAYOUT = {
  1:  { x: 120, y: 250, type: "Slack" }, 2:  { x: 280, y: 380, type: "PV" },
  3:  { x: 620, y: 380, type: "PV" },    4:  { x: 450, y: 280, type: "PQ" },
  5:  { x: 300, y: 250, type: "PQ" },    6:  { x: 320, y: 120, type: "PV" },
  7:  { x: 550, y: 200, type: "PQ" },    8:  { x: 680, y: 120, type: "PV" },
  9:  { x: 550, y: 100, type: "PQ" },    10: { x: 450, y: 50,  type: "PQ" },
  11: { x: 350, y: 60,  type: "PQ" },    12: { x: 100, y: 80,  type: "PQ" },
  13: { x: 180, y: 40,  type: "PQ" },    14: { x: 500, y: 40,  type: "PQ" },
};

const DEFAULT_VALUES = {
  1:  { v: 1.060, theta: 0.00, p: 232.4, q: -16.9 }, 2:  { v: 1.045, theta: -4.98, p: 40.0, q: 43.6 },
  3:  { v: 1.010, theta: -12.72, p: 0.0, q: 25.1 },  4:  { v: 1.019, theta: -10.33, p: -47.8, q: 3.9 },
  5:  { v: 1.020, theta: -8.78, p: -7.6, q: -1.6 },  6:  { v: 1.070, theta: -14.22, p: -11.2, q: 12.7 },
  7:  { v: 1.062, theta: -13.37, p: 0.0, q: 0.0 },   8:  { v: 1.090, theta: -13.36, p: 0.0, q: 17.6 },
  9:  { v: 1.056, theta: -14.94, p: -29.5, q: -16.6 }, 10: { v: 1.051, theta: -15.10, p: -9.0, q: -5.8 },
  11: { v: 1.057, theta: -14.79, p: -3.5, q: -1.8 }, 12: { v: 1.055, theta: -15.07, p: -6.1, q: -1.6 },
  13: { v: 1.050, theta: -15.16, p: -13.5, q: -1.8 }, 14: { v: 1.036, theta: -16.04, p: -14.9, q: -5.0 },
};

const BRANCHES = [
  [1, 2], [1, 5], [2, 3], [2, 4], [2, 5], [3, 4], [4, 5],
  [4, 7], [4, 9], [5, 6], [6, 11], [6, 12], [6, 13],
  [7, 8], [7, 9], [9, 10], [9, 14], [10, 11], [12, 13], [13, 14]
];

export default function Schema({ resultats }) {
  const [selectedBus, setSelectedBus] = useState(null);
  const [showValues, setShowValues] = useState(true);

  const busData = useMemo(() => {
    const data = {};
    Object.entries(BUS_LAYOUT).forEach(([idStr, layout]) => {
      const id = Number(idStr);
      const simResult = resultats?.find(r => r.bus === id);
      data[id] = {
        ...layout,
        v: simResult ? simResult.V : (DEFAULT_VALUES[id]?.v ?? 1.0),
        theta: simResult ? simResult.theta : (DEFAULT_VALUES[id]?.theta ?? 0.0),
        p: simResult ? simResult.P_MW : (DEFAULT_VALUES[id]?.p ?? 0.0),
        q: simResult ? simResult.Q_MVAr : (DEFAULT_VALUES[id]?.q ?? 0.0),
        isSimulated: !!simResult,
      };
    });
    return data;
  }, [resultats]);

  const getBusColor = (type) => {
    if (type === "Slack") return "#ef4444";
    if (type === "PV") return "#10b981";
    return "#3b82f6";
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-2 lg:p-4 overflow-hidden">
      
      {/* ZONE PRINCIPALE : LE CANVAS (SCHEMA) */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[50vh]">
        
        {/* Barre d'outils */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 lg:px-4 py-2 flex flex-wrap justify-between items-center gap-2 z-10 shrink-0">
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <h2 className="font-bold text-slate-700 hidden sm:block">IEEE 14-Bus</h2>
            {resultats ? (
              <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Simulé
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold">Par défaut</span>
            )}
            <div className="hidden md:flex gap-3 text-xs ml-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Slack</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> PV</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> PQ</span>
            </div>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
            <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
            <span className="hidden sm:inline">Afficher les valeurs</span>
          </label>
        </div>

        {/* Le Canvas SVG (Responsive) */}
        <div className="flex-1 relative bg-[#f8fafc] min-h-0">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></svg>
          
          {/* preserveAspectRatio="xMidYMid meet" est la clé pour que le SVG s'adapte sans se couper */}
          <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet" className="w-full h-full relative z-10">
            {BRANCHES.map(([from, to], idx) => {
              const p1 = busData[from];
              const p2 = busData[to];
              const isHighlighted = selectedBus && (selectedBus === from || selectedBus === to);
              return (
                <g key={idx}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={isHighlighted ? "#0f7a8a" : "#94a3b8"} strokeWidth={isHighlighted ? 3.5 : 2} className="transition-all duration-300" />
                  <circle cx={p1.x} cy={p1.y} r={3} fill={isHighlighted ? "#0f7a8a" : "#64748b"} />
                  <circle cx={p2.x} cy={p2.y} r={3} fill={isHighlighted ? "#0f7a8a" : "#64748b"} />
                </g>
              );
            })}

            {Object.entries(busData).map(([idStr, bus]) => {
              const id = Number(idStr);
              const isSelected = selectedBus === id;
              const color = getBusColor(bus.type);
              const barWidth = 40;
              const barHeight = 6;

              return (
                <g key={id} onClick={() => setSelectedBus(isSelected ? null : id)} className="cursor-pointer group">
                  {isSelected && <rect x={bus.x - barWidth/2 - 6} y={bus.y - barHeight/2 - 6} width={barWidth + 12} height={barHeight + 12} rx={6} fill="none" stroke={color} strokeWidth="2" className="animate-pulse" />}
                  <rect x={bus.x - barWidth/2} y={bus.y - barHeight/2} width={barWidth} height={barHeight} rx={2} fill={color} className="transition-transform duration-200 group-hover:scale-110" style={{ transformOrigin: `${bus.x}px ${bus.y}px` }} />
                  <text x={bus.x} y={bus.y - 12} textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="bold" className="pointer-events-none select-none">
                    {id}
                  </text>
                  {showValues && (
                    <g className="pointer-events-none select-none">
                      <text x={bus.x} y={bus.y + 18} textAnchor="middle" fontSize="8.5" fill={bus.isSimulated ? "#0f766e" : "#475569"} fontFamily="monospace" fontWeight="600">V: {bus.v.toFixed(3)}</text>
                      <text x={bus.x} y={bus.y + 28} textAnchor="middle" fontSize="8.5" fill={bus.isSimulated ? "#0f766e" : "#475569"} fontFamily="monospace">θ: {bus.theta.toFixed(1)}°</text>
                      <text x={bus.x} y={bus.y + 38} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">P: {bus.p.toFixed(1)}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* PANNEAU LATÉRAL (Responsive : passe en bas sur mobile) */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4 max-h-[40vh] lg:max-h-full overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-slate-800 mb-1">Inspecteur</h3>
          <p className="text-xs text-slate-500">Cliquez sur un bus pour le détail.</p>
        </div>

        {selectedBus ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Bus {selectedBus}</h2>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: getBusColor(busData[selectedBus].type) }}>
                  {busData[selectedBus].type}
                </span>
              </div>
              <button onClick={() => setSelectedBus(null)} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full w-7 h-7 flex items-center justify-center transition-colors">×</button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm text-blue-800 font-medium">Tension</span>
                <span className="font-mono font-bold text-blue-700">{busData[selectedBus].v.toFixed(4)} <span className="text-xs font-normal">pu</span></span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm text-slate-600 font-medium">Angle</span>
                <span className="font-mono font-bold text-slate-700">{busData[selectedBus].theta.toFixed(2)} <span className="text-xs font-normal">°</span></span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-sm text-emerald-800 font-medium">P injecté</span>
                <span className="font-mono font-bold text-emerald-700">{busData[selectedBus].p.toFixed(2)} <span className="text-xs font-normal">MW</span></span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-sm text-amber-800 font-medium">Q injecté</span>
                <span className="font-mono font-bold text-amber-700">{busData[selectedBus].q.toFixed(2)} <span className="text-xs font-normal">MVAr</span></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-slate-400">Aucun nœud sélectionné.</p>
          </div>
        )}
      </div>
    </div>
  );
}