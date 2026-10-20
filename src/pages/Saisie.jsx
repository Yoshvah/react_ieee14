import { useState } from "react";

// ---------- Carte de section ----------
function Carte({ titre, sousTitre, badge, children }) {
  return (
    <section className="mb-6 sm:mb-8 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 truncate">{titre}</h2>
            {sousTitre && <p className="text-xs text-slate-500 truncate">{sousTitre}</p>}
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

// Styles réutilisables
const inp = "w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-center text-xs sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const sel = "w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-center text-xs sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer";
const th = "border-b border-slate-200 px-2 py-2 font-semibold text-slate-600 text-center text-xs sm:text-sm whitespace-nowrap";
const td = "border-b border-slate-100 p-1";

const champsModifiables = {
  Slack: ["V", "theta"],
  PV: ["P", "V"],
  PQ: ["P", "Q"],
};

// Vérifie si une cellule peut être modifiée
function peutModifier(typeBus, colonne) {
  return champsModifiables[typeBus]?.includes(colonne) ?? false;
}



export default function Saisie() {
  // Un seul état global pour tout le formulaire
  const [form, setForm] = useState({});

  // Fonction magique qui met à jour l'état selon le nom du champ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* En-tête */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Paramètres du réseau
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Saisie de données — <span className="text-blue-600">IEEE 14</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Renseignez les grandeurs électriques des nœuds et des branches du réseau.
        </p>
      </div>

      <Carte titre="Nœuds" badge="14 bus">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className={`${th} w-12`}>N°</th>
                <th className={th}>Type</th>
                <th className={th}>P (p.u.)</th>
                <th className={th}>Q (p.u.)</th>
                <th className={th}>V (p.u.)</th>
                <th className={th}>θ (°)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">1</td>
                <td className={td}><select name="n1_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n1_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n1_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n1_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n1_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">2</td>
                <td className={td}><select name="n2_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n2_p" value={form.n2_p ?? ""} disabled={!peutModifier(form.n2_type, "P")} className={inp} onChange={handleChange} /></td>
                <td className={td}><input type="number" name="n2_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n2_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n2_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">3</td>
                <td className={td}><select name="n3_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n3_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n3_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n3_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n3_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">4</td>
                <td className={td}><select name="n4_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n4_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n4_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n4_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n4_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">5</td>
                <td className={td}><select name="n5_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n5_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n5_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n5_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n5_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">6</td>
                <td className={td}><select name="n6_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n6_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n6_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n6_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n6_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">7</td>
                <td className={td}><select name="n7_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n7_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n7_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n7_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n7_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">8</td>
                <td className={td}><select name="n8_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n8_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n8_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n8_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n8_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">9</td>
                <td className={td}><select name="n9_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n9_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n9_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n9_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n9_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">10</td>
                <td className={td}><select name="n10_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n10_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n10_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n10_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n10_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">11</td>
                <td className={td}><select name="n11_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n11_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n11_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n11_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n11_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">12</td>
                <td className={td}><select name="n12_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n12_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n12_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n12_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n12_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">13</td>
                <td className={td}><select name="n13_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n13_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n13_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n13_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n13_theta" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">14</td>
                <td className={td}><select name="n14_type" onChange={handleChange} className={sel}><option value="">--</option><option>Slack</option><option>PV</option><option>PQ</option></select></td>
                <td className={td}><input type="number" name="n14_p" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n14_q" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n14_v" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="n14_theta" onChange={handleChange} className={inp} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Carte>

      {/* TABLEAU BRANCHES  */}
      <Carte titre="Branches" badge="14 lignes">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className={`${th} w-12`}>N°</th>
                <th className={th}>Nœud arrivée</th>
                <th className={th}>R (p.u.)</th>
                <th className={th}>X (p.u.)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">1</td>
                <td className={td}><input type="number" name="b1_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b1_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b1_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">2</td>
                <td className={td}><input type="number" name="b2_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b2_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b2_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">3</td>
                <td className={td}><input type="number" name="b3_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b3_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b3_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">4</td>
                <td className={td}><input type="number" name="b4_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b4_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b4_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">5</td>
                <td className={td}><input type="number" name="b5_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b5_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b5_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">6</td>
                <td className={td}><input type="number" name="b6_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b6_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b6_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">7</td>
                <td className={td}><input type="number" name="b7_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b7_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b7_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">8</td>
                <td className={td}><input type="number" name="b8_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b8_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b8_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">9</td>
                <td className={td}><input type="number" name="b9_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b9_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b9_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">10</td>
                <td className={td}><input type="number" name="b10_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b10_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b10_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">11</td>
                <td className={td}><input type="number" name="b11_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b11_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b11_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">12</td>
                <td className={td}><input type="number" name="b12_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b12_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b12_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">13</td>
                <td className={td}><input type="number" name="b13_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b13_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b13_x" onChange={handleChange} className={inp} /></td>
              </tr>
              <tr className="bg-slate-50/40 hover:bg-blue-50/60">
                <td className="text-center font-bold text-slate-500">14</td>
                <td className={td}><input type="number" name="b14_arr" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b14_r" onChange={handleChange} className={inp} /></td>
                <td className={td}><input type="number" name="b14_x" onChange={handleChange} className={inp} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Carte>

    </div>
  );
}