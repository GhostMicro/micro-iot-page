import React, { useState } from 'react';
import { X, Copy, Download, Box, Code2 } from 'lucide-react';
import { useProjectStore } from '@/lib/store';
import { SUPPORTED_LIBRARIES } from '@/data/libraries';
import { SUPPORTED_MODULES } from '@/data/modules';

interface CodePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    code: string;
    filename: string;
}

export function CodePreviewModal({ isOpen, onClose, code, filename }: CodePreviewModalProps) {
    const { modules } = useProjectStore();
    const [tab, setTab] = useState<'code' | 'deps'>('code');

    if (!isOpen) return null;

    // Calculate unique dependencies
    const requiredLibs = new Set<string>();
    requiredLibs.add('pubsubclient');
    requiredLibs.add('arduinojson');

    modules.forEach(m => {
        const def = SUPPORTED_MODULES.find(d => d.id === m.defId);
        if (def?.libraries) {
            def.libraries.forEach(lib => requiredLibs.add(lib));
        }
    });

    const libList = Array.from(requiredLibs).map(id => SUPPORTED_LIBRARIES[id]).filter(Boolean);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                        <h3 className="text-white font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Generated Code
                        </h3>
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setTab('code')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${tab === 'code' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                            >
                                <Code2 size={14} /> Source
                            </button>
                            <button
                                onClick={() => setTab('deps')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${tab === 'deps' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/40 hover:text-white'}`}
                            >
                                <Box size={14} /> Dependencies <span className="bg-white/10 px-1.5 rounded-full text-[10px] text-white/60">{libList.length}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {tab === 'code' && (
                            <>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                    title="Copy to Clipboard"
                                >
                                    <Copy size={18} />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white text-xs font-bold shadow-lg shadow-cyan-900/20 flex items-center gap-2"
                                >
                                    <Download size={16} /> Download .ino
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-colors ml-2 border-l border-white/10 pl-4"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {tab === 'code' ? (
                        <div className="absolute inset-0 overflow-auto p-4 bg-[#050505]">
                            <pre className="font-mono text-xs md:text-sm text-gray-300 leading-relaxed tab-4">
                                <code>{code}</code>
                            </pre>
                        </div>
                    ) : (
                        <div className="absolute inset-0 overflow-auto p-6 bg-[#050505]">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Box className="text-cyan-400" size={20} /> Required Libraries
                            </h4>
                            <p className="text-white/50 text-sm mb-6 max-w-2xl">
                                To compile this sketch, you need to install the following libraries via the Arduino Library Manager (Sketch {'>'} Include Library {'>'} Manage Libraries).
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {libList.map(lib => (
                                    <div key={lib.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                                                {lib.managerName}
                                            </h5>
                                            <span className="text-[10px] uppercase font-mono bg-white/10 text-white/40 px-2 py-0.5 rounded">
                                                {lib.author}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/50 mb-4 line-clamp-2 h-8">
                                            {lib.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs bg-black/40 p-2 rounded border border-white/5 font-mono text-white/40">
                                            <span>Install Name:</span>
                                            <span className="text-cyan-400 select-all cursor-text">{lib.managerName}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
