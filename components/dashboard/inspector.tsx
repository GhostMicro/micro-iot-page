import { SUPPORTED_MODULES } from "@/data/modules";
import { useProjectStore } from "@/lib/store";
import { Plus, Terminal, Activity } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Inspector() {
    const [tab, setTab] = useState<'catalog' | 'logs'>('catalog');
    const [category, setCategory] = useState<string>('all');
    const { addModule, logs, clearLogs } = useProjectStore();

    const categories = ['all', ...Array.from(new Set(SUPPORTED_MODULES.map(m => m.category)))];
    const filteredModules = category === 'all'
        ? SUPPORTED_MODULES
        : SUPPORTED_MODULES.filter(m => m.category === category);

    return (
        <aside className="w-80 h-full bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setTab('catalog')}
                    className={cn(
                        "flex-1 p-3 text-sm font-medium transition-colors border-b-2 hover:bg-white/5",
                        tab === 'catalog' ? "border-cyan-500 text-cyan-400" : "border-transparent text-white/40 hover:text-white"
                    )}
                >
                    <span className="flex items-center justify-center gap-2"><Plus size={16} /> Catalog</span>
                </button>
                <button
                    onClick={() => setTab('logs')}
                    className={cn(
                        "flex-1 p-3 text-sm font-medium transition-colors border-b-2 hover:bg-white/5",
                        tab === 'logs' ? "border-purple-500 text-purple-400" : "border-transparent text-white/40 hover:text-white"
                    )}
                >
                    <span className="flex items-center justify-center gap-2"><Terminal size={16} /> Monitor</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-transparent scrollbar-thin scrollbar-thumb-white/10">
                {tab === 'catalog' ? (
                    <div className="flex flex-col h-full">
                        {/* Category Filter */}
                        <div className="p-3 border-b border-white/10 overflow-x-auto">
                            <div className="flex gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all",
                                            category === cat
                                                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Module List */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {filteredModules.map(module => (
                                <div key={module.id} className="group relative bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{module.name}</h3>
                                        <button
                                            onClick={() => {
                                                const res = addModule(module.id);
                                                if (!res.success) alert(res.error);
                                            }}
                                            className="bg-white/5 hover:bg-cyan-500 text-white/60 hover:text-black p-1.5 rounded-lg transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-white/50 mb-3 leading-relaxed">{module.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {module.requires.map(req => (
                                            <span key={req} className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-black/40 text-white/30 border border-white/5">
                                                {req}
                                            </span>
                                        ))}
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500/80 border border-yellow-500/20">
                                            ⚡ {module.powerConsumption}mA
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full font-mono text-xs">
                        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {logs.length === 0 && <div className="text-white/20 italic">No logs yet...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className="text-green-400 border-l-2 border-green-500/30 pl-2">
                                    {log}
                                </div>
                            ))}
                        </div>
                        <div className="p-2 border-t border-white/10 bg-black/40">
                            <button onClick={clearLogs} className="text-white/40 hover:text-white text-xs px-2 py-1">Clear Output</button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
