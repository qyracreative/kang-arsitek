/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  MonitorPlay,
  HardHat,
  Trash2,
  Clock,
  Layout,
  RefreshCcw,
  CloudCheck,
  AlertCircle
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
import { PromptState, ScenePrompt, ProductionStatus, Project, SyncStatus } from './types';
import { generateScenes } from './utils/promptGenerator';
import { 
  syncProjectToSheets, 
  updateProjectStatusInSheets, 
  fetchProjectsFromSheets,
  isSheetSyncConfigured 
} from './services/sheetSync';

// --- Utils ---
const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(timestamp));
};

// --- Sub-components ---

const SyncBadge = ({ status }: { status: SyncStatus }) => {
  if (status === 'idle') return null;

  const config = {
    syncing: { icon: <RefreshCcw className="w-3 h-3 animate-spin" />, text: 'Syncing...', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    synced: { icon: <CloudCheck className="w-3 h-3" />, text: 'Synced', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    failed: { icon: <AlertCircle className="w-3 h-3" />, text: 'Sync Failed', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    unconfigured: { icon: <AlertCircle className="w-3 h-3" />, text: 'Sync Offline', color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' }
  }[status];

  return (
    <div 
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${config.color} animate-in fade-in duration-300`}
      title={status === 'unconfigured' ? 'Configure VITE_GOOGLE_SCRIPT_URL in your environment' : ''}
    >
      {config.icon}
      {config.text}
    </div>
  );
};

const StatusBadge = ({ status, onChange, compact = false, syncStatus = 'idle' }: { 
  status: ProductionStatus, 
  onChange?: (s: ProductionStatus) => void, 
  compact?: boolean,
  syncStatus?: SyncStatus
}) => (
  <div className={`flex flex-col ${compact ? 'items-start' : 'items-end'} gap-1.5`}>
    {!compact && (
      <div className="flex items-center gap-3">
        <SyncBadge status={syncStatus} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Production Status</span>
      </div>
    )}
    <div className="relative">
      <select 
        value={status}
        onChange={(e) => onChange?.(e.target.value as ProductionStatus)}
        disabled={!onChange}
        className={`appearance-none ${compact ? 'pl-2 pr-6 py-0.5' : 'pl-4 pr-10 py-2'} rounded-lg text-[10px] md:text-xs font-bold border cursor-pointer outline-none transition-all duration-300 ${STATUS_COLORS[status]} ${!onChange ? 'cursor-default pointer-events-none' : ''}`}
      >
        {STATUSES.map(s => (
          <option key={s} value={s} className="bg-zinc-900 text-zinc-200">{s}</option>
        ))}
      </select>
      {onChange && <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-60 pointer-events-none`} />}
    </div>
  </div>
);

const ProjectCard = ({ project, isActive, onClick, onDelete }: { 
  key?: React.Key,
  project: Project, 
  isActive: boolean, 
  onClick: () => void, 
  onDelete: (e: React.MouseEvent) => void 
}) => (
  <motion.div
    layout
    whileHover={{ x: 4 }}
    onClick={onClick}
    className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 relative group ${
      isActive 
        ? 'bg-zinc-800 border-yellow-500/50 shadow-lg shadow-yellow-500/5' 
        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
    }`}
  >
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-start gap-2">
        <h3 className={`text-xs font-bold truncate tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
          {project.title}
        </h3>
        <button 
          onClick={onDelete}
          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all text-zinc-600"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <StatusBadge status={project.status} compact />
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <Clock className="w-3 h-3" />
          {formatDate(project.createdAt)}
        </div>
      </div>
    </div>
  </motion.div>
);

const ProjectSidebar = ({ 
  projects, 
  currentProjectId, 
  onProjectSelect, 
  onDeleteProject,
  isLoading,
  syncError
}: { 
  projects: Project[], 
  currentProjectId: string | null, 
  onProjectSelect: (id: string) => void,
  onDeleteProject: (id: string) => void,
  isLoading?: boolean,
  syncError?: boolean
}) => (
  <div className="flex flex-col h-full bg-zinc-950/50 backdrop-blur-xl border-r border-zinc-900 overflow-hidden">
    <div className="p-6 border-b border-zinc-900">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
          <Clock className="w-4 h-4 text-zinc-500" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">Project History</h2>
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCcw className="w-8 h-8 mx-auto text-yellow-500/40 animate-spin" />
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
            Fetching from Cloud...
          </p>
        </div>
      ) : syncError ? (
        <div className="p-4 mx-4 rounded-xl border border-red-500/10 bg-red-500/5 space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Connectivity Issue</span>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed">
              Google Sheets sync is failing. Verify your <span className="text-zinc-300">VITE_GOOGLE_SCRIPT_URL</span> is correct and deployed with <span className="text-zinc-300">"Anyone"</span> access.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors border border-red-500/20"
          >
            Retry Connection
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <Clock className="w-8 h-8 mx-auto text-zinc-800" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-relaxed">
              No history found
            </p>
            <p className="text-[9px] text-zinc-800 font-medium uppercase">Generate to save project</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          {projects.sort((a, b) => b.createdAt - a.createdAt).map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              isActive={currentProjectId === project.id}
              onClick={() => onProjectSelect(project.id)}
              onDelete={(e) => {
                e.stopPropagation();
                onDeleteProject(project.id);
              }}
            />
          ))}
        </AnimatePresence>
      )}
    </div>

    {/* Setup Helper Footer */}
    <div className="p-4 bg-zinc-950 border-t border-zinc-900 space-y-2">
      {syncError && projects.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-2">
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span className="text-[8px] font-black text-red-500/80 uppercase tracking-tighter">Sync Failing: Local data shown</span>
        </div>
      )}
      <button 
        onClick={() => {
          if (confirm('Clear local history? This cannot be undone.')) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            window.location.reload();
          }
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-600 transition-all active:scale-[0.98]"
      >
        <RefreshCcw className="w-3 h-3" />
        Force Refetch
      </button>
    </div>
  </div>
);

const PromptForm = ({ state, setState, onGenerate }: { 
  state: PromptState, 
  setState: React.Dispatch<React.SetStateAction<PromptState>>,
  onGenerate: () => void
}) => (
  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl">
    <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2.5 uppercase tracking-wider">
      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
        <Sparkles className="w-4 h-4 text-yellow-500" />
      </div>
      Configurator
    </h2>

    <div className="space-y-5">
      <Selector 
        label="Character" 
        icon={<User className="w-3.5 h-3.5" />}
        value={state.character}
        options={CHARACTERS}
        onChange={(v) => setState(prev => ({ ...prev, character: v }))}
      />
      <Selector 
        label="Location" 
        icon={<MapPin className="w-3.5 h-3.5" />}
        value={state.location}
        options={LOCATIONS}
        onChange={(v) => setState(prev => ({ ...prev, location: v }))}
      />
      <Selector 
        label="Building" 
        icon={<Building2 className="w-3.5 h-3.5" />}
        value={state.building}
        options={BUILDINGS}
        onChange={(v) => setState(prev => ({ ...prev, building: v }))}
      />
      <Selector 
        label="Weather" 
        icon={<CloudSun className="w-3.5 h-3.5" />}
        value={state.weather}
        options={WEATHER}
        onChange={(v) => setState(prev => ({ ...prev, weather: v }))}
      />
      <Selector 
        label="Theme" 
        icon={<Palette className="w-3.5 h-3.5" />}
        value={state.theme}
        options={THEMES}
        onChange={(v) => setState(prev => ({ ...prev, theme: v }))}
      />
    </div>

    <button
      onClick={onGenerate}
      className="w-full py-4 rounded-xl bg-yellow-500 text-black font-extrabold hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/10 active:scale-[0.98] uppercase tracking-wider text-sm"
    >
      <MonitorPlay className="w-5 h-5" />
      Generate 8 Scene Prompts
    </button>
  </div>
);

interface SceneCardProps {
  key?: React.Key;
  scene: ScenePrompt;
  onCopy: (content: string, id: number) => void;
  isCopied: boolean;
}

const SceneCard = ({ scene, onCopy, isCopied }: SceneCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 group relative flex flex-col h-full"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[11px] font-black text-yellow-500 border border-zinc-700">
          {scene.id}
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-300">{scene.title.split(': ')[1] || scene.title}</span>
      </div>
      <button 
        onClick={() => onCopy(scene.content, scene.id)}
        className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 transition-all text-zinc-400 hover:text-white border border-transparent hover:border-zinc-600"
        title="Copy scene prompt"
      >
        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
    <div className="flex-1 overflow-y-auto pr-1 max-h-[160px] custom-scrollbar">
      <p className="text-sm text-zinc-400 leading-relaxed font-sans group-hover:text-zinc-200 transition-colors">
        {scene.content}
      </p>
    </div>
  </motion.div>
);

function Selector({ label, icon, value, options, onChange }: { 
  label: string, 
  icon: React.ReactNode, 
  value: string, 
  options: string[], 
  onChange: (v: string) => void 
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 flex items-center gap-2">
        <span className="text-yellow-500/60">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-zinc-950/50 border border-zinc-800/50 rounded-xl pl-4 pr-10 py-3 text-xs md:text-sm text-zinc-300 outline-none focus:border-yellow-500/40 focus:ring-1 focus:ring-yellow-500/20 transition-all cursor-pointer hover:bg-zinc-950"
        >
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-zinc-900 text-zinc-200">{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
      </div>
    </div>
  );
}

// --- Main App ---

const LOCAL_STORAGE_KEY = 'kang_arsitek_projects';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Load from Google Sheets or localStorage
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingHistory(true);
      
      const configured = isSheetSyncConfigured();
      if (!configured) {
        setSyncStatus('unconfigured');
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            setProjects(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse projects from localStorage', e);
          }
        }
        setIsLoadingHistory(false);
        return;
      }
      
      // Try Google Sheets
      try {
        const sheetsProjects = await fetchProjectsFromSheets();
        
        if (sheetsProjects) {
          setProjects(sheetsProjects);
          setSyncStatus('idle');
        } else {
          // fetchProjectsFromSheets returns null on failure
          setSyncStatus('failed');
          loadLocalBackup();
        }
      } catch (err) {
        console.error('Initialization fetch error:', err);
        setSyncStatus('failed');
        loadLocalBackup();
      }
      
      setIsLoadingHistory(false);
    };

    const loadLocalBackup = () => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          setProjects(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse projects from localStorage', e);
        }
      }
    };

    initializeData();
  }, []);

  // Sync to localStorage as secondary backup
  useEffect(() => {
    if (!isLoadingHistory) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects, isLoadingHistory]);

  const handleGenerate = async () => {
    const scenes = generateScenes(state);
    setGeneratedPrompts(scenes);
    
    // Auto save new project
    const newProject: Project = {
      ...state,
      id: crypto.randomUUID?.() || Date.now().toString(),
      title: `${state.building.split(' ').slice(0, 3).join(' ')} at ${state.location.split(' ').slice(0, 2).join(' ')}`,
      prompts: scenes,
      status: 'Generated',
      createdAt: Date.now()
    };

    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    setState(prev => ({ ...prev, status: 'Generated' }));

    // Sync to Google Sheets
    setSyncStatus('syncing');
    const success = await syncProjectToSheets(newProject);
    setSyncStatus(success ? 'synced' : 'failed');
    if (success) {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleUpdateStatus = async (status: ProductionStatus) => {
    setState(prev => ({ ...prev, status }));
    if (currentProjectId) {
      setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, status } : p));
      
      // Update sync status in Google Sheets
      setSyncStatus('syncing');
      const success = await updateProjectStatusInSheets(currentProjectId, status);
      
      if (!success) {
        setSyncStatus('failed');
        // Optional: Re-try once
        const retrySuccess = await updateProjectStatusInSheets(currentProjectId, status);
        if (retrySuccess) setSyncStatus('synced');
      } else {
        setSyncStatus('synced');
      }
      
      if (success) {
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }
  };

  const handleSelectProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    setCurrentProjectId(id);
    setState({
      character: project.character,
      location: project.location,
      building: project.building,
      weather: project.weather,
      theme: project.theme,
      status: project.status,
    });
    setGeneratedPrompts(project.prompts);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setGeneratedPrompts([]);
    }
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
    <div className="min-h-screen bg-[#09090B] text-zinc-200 selection:bg-yellow-500/30 selection:text-white overflow-hidden font-sans flex flex-col md:flex-row">
      
      {/* Scrollable Sidebar */}
      <aside className="w-full md:w-[320px] md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-zinc-900 shrink-0">
        <ProjectSidebar 
          projects={projects}
          currentProjectId={currentProjectId}
          onProjectSelect={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          isLoading={isLoadingHistory}
          syncError={syncStatus === 'failed'}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-16 space-y-12">
          
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-xl shadow-yellow-500/20 ring-4 ring-yellow-500/10">
                  <HardHat className="text-zinc-950 w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
                    Kang Arsitek
                  </h1>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium tracking-[0.15em] uppercase">
                    Construction Prompt Pro
                  </p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm max-w-md font-medium leading-relaxed">
                Professional architectural scene generator. Design, generate, and manage cinematic construction workflows.
              </p>
            </div>

            <StatusBadge 
              status={state.status} 
              onChange={handleUpdateStatus} 
              syncStatus={syncStatus}
            />
          </header>

          {/* Dashboard Content */}
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-12">
            
            {/* Left Configuration Panel */}
            <section className="lg:col-span-5 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              <PromptForm state={state} setState={setState} onGenerate={handleGenerate} />
            </section>

            {/* Right Results Panel */}
            <section className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
              <div className="flex items-center justify-between min-h-[40px]">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                  <h2 className="text-lg font-black uppercase tracking-widest text-white italic">
                    Cinematic Timeline
                  </h2>
                </div>
                
                {generatedPrompts.length > 0 && (
                  <button 
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-[11px] font-black uppercase tracking-wider transition-all border border-zinc-700 shadow-lg active:scale-[0.98]"
                  >
                    {isCopyingAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardCheck className="w-3.5 h-3.5 text-yellow-500" />}
                    {isCopyingAll ? 'Batch Copied' : 'Copy All Scenes'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[400px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  {generatedPrompts.length === 0 ? (
                    <motion.div 
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full h-full flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800/50 rounded-[2rem] bg-zinc-950/20 py-24"
                    >
                      <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
                        <Layout className="w-8 h-8 opacity-20 text-yellow-500" />
                      </div>
                      <p className="text-lg font-bold tracking-tight text-zinc-500 uppercase">Waitlist Stage Empty</p>
                      <p className="text-sm font-medium opacity-50 uppercase tracking-[0.2em] text-center mt-2">Initialize configuration to see results.</p>
                    </motion.div>
                  ) : (
                    generatedPrompts.map((scene) => (
                      <SceneCard 
                        key={`${currentProjectId}-${scene.id}`} 
                        scene={scene} 
                        onCopy={handleCopy} 
                        isCopied={copiedId === scene.id} 
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </section>
          </main>

          {/* Footer Component */}
          <footer className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-600">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">© 2026 KANG ARSITEK STUDIO</span>
              <div className="h-1 w-1 rounded-full bg-zinc-800" />
              <span className="text-[10px] font-bold tracking-widest opacity-50 uppercase">Architecture Excellence</span>
            </div>
            
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-zinc-700">Project Engine V4.2</span>
              <span className="text-yellow-500">Authorized Access Only</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

