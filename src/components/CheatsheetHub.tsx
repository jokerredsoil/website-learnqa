import React, { useState } from 'react';
import { DUMMIES_ANALOGIES, EDGE_CASE_CHEAT_SHEET } from '../data/glossaryData';
import { 
  BookOpen, 
  Lightbulb, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Terminal,
  ShieldCheck
} from 'lucide-react';

export const CheatsheetHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'analogies' | 'edgecases'>('analogies');

  const filteredAnalogies = DUMMIES_ANALOGIES.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.technicalTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.theDummiesAnalogy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCheatSheets = EDGE_CASE_CHEAT_SHEET.filter(c =>
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.payloads.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40">
              For Dummies Mental Models
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">
              The SecQA Dummies Decoder &amp; Edge-Case Cheatsheet
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Complex cybersecurity concepts simplified with memorable real-world analogies, alongside a ready-to-use edge case payload reference for software testers.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search analogies or payloads..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setActiveTab('analogies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'analogies'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Explain Like I'm Five (Analogies)</span>
          </button>

          <button
            onClick={() => setActiveTab('edgecases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'edgecases'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Edge-Case Testing Cheatsheet</span>
          </button>
        </div>
      </div>

      {/* Analogies View */}
      {activeTab === 'analogies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAnalogies.map((analogy, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                    {analogy.technicalTerm}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    {analogy.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  {analogy.title}
                </h3>

                {/* The Analogy */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-amber-200/90 leading-relaxed">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>The "For Dummies" Mental Model:</span>
                  </div>
                  <p>{analogy.theDummiesAnalogy}</p>
                </div>
              </div>

              {/* Developer Mistake vs SecQA Remedy */}
              <div className="space-y-2 text-xs pt-2">
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-200">
                  <strong className="text-rose-300 block mb-0.5">⚠️ The Common Developer Pitfall:</strong>
                  {analogy.theDeveloperMistake}
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-200">
                  <strong className="text-emerald-300 block mb-0.5">🛡️ The SecQA Solution:</strong>
                  {analogy.theSecQARemedy}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edge-Cases Reference View */}
      {activeTab === 'edgecases' && (
        <div className="space-y-6">
          {filteredCheatSheets.map((sheet, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  {sheet.category}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {sheet.description}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                      <th className="p-3">Edge-Case Name</th>
                      <th className="p-3 font-mono">Sample Payload</th>
                      <th className="p-3">Vulnerability / Failure Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {sheet.payloads.map((p, pIdx) => (
                      <tr key={pIdx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-sans font-semibold text-white">{p.name}</td>
                        <td className="p-3 text-teal-300 select-all font-bold">{p.value}</td>
                        <td className="p-3 font-sans text-rose-300">{p.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
