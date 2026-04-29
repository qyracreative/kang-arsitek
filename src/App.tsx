/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  User, 
  CloudSun, 
  Palette, 
  Sparkles, 
  Copy, 
  Check, 
  ClipboardCheck,
  LayoutDashboard,
  ChevronDown,
  MonitorPlay
} from 'lucide-react';
import { 
  CHARACTERS, 
  LOCATIONS, 
  BUILDINGS, 
  WEATHER, 
  THEMES, 
  STATUSES, 
  STATUS_COLORS 
} from './constants';
import { PromptState, ScenePrompt, ProductionStatus } from './types';
import { generateScenes } from './utils/promptGenerator';

export default function App() {
  const [state, setState] = useState<PromptState>({
    character: CHARACTERS[0],
    location: LOCATIONS[0],
    building: BUILDINGS[0],
    weather: WEATHER[0],
    theme: THEMES[0],
    status: 'Draft',
  });

  const [generatedPrompts, setGeneratedPrompts] = useState<ScenePrompt[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isCopyingAll, setIsCopyingAll] = useState(false);

  const handleGenerate = () => {
    const scenes = generateScenes(state);
    setGeneratedPrompts(scenes);
    setState(prev => ({ ...prev, status: 'Generated' }));
  };

  const handleCopy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const allContent = generatedPrompts.map(p => `[${p.title}]\n${p.content}`).join('\n\n');
    navigator.clipboard.writeText(allContent);
    setIsCopyingAll(true);
    setTimeout(() => setIsCopyingAll(false), 2000);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center border border-brand/30">
            <LayoutDashboard className="text-brand w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Kang Arsitek</h1>
            <p className="text-slate-400 text-sm">Cinematic Scene Prompt Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Production Status</span>
            <div className="relative group">
              <select 
                value={state.status}
                onChange={(e) => setState(prev => ({ ...prev, status: e.target.value as ProductionStatus }))}
                className={`appearance-none px-4 py-1.5 rounded-full text-xs font-medium border cursor-pointer outline-none transition-all ${STATUS_COLORS[state.status]}`}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s} className="bg-[#0A0A0B] text-slate-200">{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05] space-y-6">
            <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              Generator Parameters
            </h2>

            <div className="space-y-4">
              <Selector 
                label="Character" 
                icon={<User className="w-4 h-4 text-brand" />}
                value={state.character}
                options={CHARACTERS}
                onChange={(v) => setState(prev => ({ ...prev, character: v }))}
              />
              <Selector 
                label="Location" 
                icon={<MapPin className="w-4 h-4 text-brand" />}
                value={state.location}
                options={LOCATIONS}
                onChange={(v) => setState(prev => ({ ...prev, location: v }))}
              />
              <Selector 
                label="Building" 
                icon={<Building2 className="w-4 h-4 text-brand" />}
                value={state.building}
                options={BUILDINGS}
                onChange={(v) => setState(prev => ({ ...prev, building: v }))}
              />
              <Selector 
                label="Weather" 
                icon={<CloudSun className="w-4 h-4 text-brand" />}
                value={state.weather}
                options={WEATHER}
                onChange={(v) => setState(prev => ({ ...prev, weather: v }))}
              />
              <Selector 
                label="Theme" 
                icon={<Palette className="w-4 h-4 text-brand" />}
                value={state.theme}
                options={THEMES}
                onChange={(v) => setState(prev => ({ ...prev, theme: v }))}
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-4 rounded-xl bg-brand text-black font-semibold hover:bg-brand/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95"
            >
              <MonitorPlay className="w-5 h-5" />
              Generate 8 Scenes
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" />
              Generated Prompts
            </h2>
            {generatedPrompts.length > 0 && (
              <button 
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors border border-white/10"
              >
                {isCopyingAll ? <Check className="w-3 h-3 text-emerald-400" /> : <ClipboardCheck className="w-3 h-3" />}
                {isCopyingAll ? 'Copied' : 'Copy All Scenes'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {generatedPrompts.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                  <MonitorPlay className="w-12 h-12 mb-4 opacity-20" />
                  <p>No scenes generated yet.</p>
                  <p className="text-sm">Configure parameters and click generate.</p>
                </div>
              ) : (
                generatedPrompts.map((scene, idx) => (
                  <motion.div
                    key={scene.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05] group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand">{scene.title}</span>
                      <button 
                        onClick={() => handleCopy(scene.content, scene.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                      >
                        {copiedId === scene.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans line-clamp-4 group-hover:line-clamp-none transition-all">
                      {scene.content}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-medium">
        <span>&copy; 2026 KANG ARSITEK STUDIO</span>
        <div className="flex items-center gap-6">
          <span>AI POWERED WORKFLOW</span>
          <span className="text-brand">ARCHITECTURAL EXCELLENCE</span>
        </div>
      </footer>
    </div>
  );
}

function Selector({ label, icon, value, options, onChange }: { 
  label: string, 
  icon: React.ReactNode, 
  value: string, 
  options: string[], 
  onChange: (v: string) => void 
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-brand/40 focus:bg-white/[0.05] transition-all cursor-pointer"
        >
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-[#151619] text-slate-200">{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}
