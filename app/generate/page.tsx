"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Inspector } from "@/components/dashboard/inspector";
import { BoardView } from "@/components/dashboard/board-view";
import { useWebSerial } from "@/components/hooks/use-web-serial";
import { useProjectStore } from "@/lib/store";
import { generateArduinoCode } from "@/lib/generator/code-gen";
import { Download, PlayCircle, Zap } from "lucide-react";
import { useState } from "react";
import { CodePreviewModal } from "@/components/ui/code-preview-modal";

export default function GeneratorPage() {
    const { isConnected, connect, disconnect } = useWebSerial();
    const state = useProjectStore();

    const [showPreview, setShowPreview] = useState(false);
    const [generatedCode, setGeneratedCode] = useState("");

    const handleGenerate = async () => {
        // Auto-generate Identity if missing
        if (!state.mqttConfig.identity) {
            state.addLog("Auto-generating GhostPass Identity...");
            await state.generateIdentity();
        }

        // Re-fetch state to get the new identity
        const freshState = useProjectStore.getState();

        const code = generateArduinoCode(freshState);
        setGeneratedCode(code);
        setShowPreview(true);
    };

    return (
        <main className="flex h-screen w-screen overflow-hidden bg-[#050505] text-foreground font-sans selection:bg-primary/30">
            <CodePreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                code={generatedCode}
                filename={`micro_iot_${state.board.id}.ino`}
            />

            {/* Left Panel */}
            <Sidebar />

            {/* Center Stage */}
            <div className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_100%)]">
                {/* Top Bar */}
                <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    <div className="pointer-events-auto flex gap-2">
                        <button
                            onClick={isConnected ? disconnect : connect}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold backdrop-blur transition-all ${isConnected
                                ? "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30"
                                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                }`}
                        >
                            <Zap size={14} className={isConnected ? "fill-green-400" : ""} />
                            {isConnected ? "Connected" : "Connect Board"}
                        </button>
                    </div>

                    <div className="pointer-events-auto">
                        <button
                            onClick={handleGenerate}
                            className="group flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-full text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all hover:scale-105 cursor-pointer"
                        >
                            <Download size={16} />
                            <span>Generate Code</span>
                        </button>
                    </div>
                </header>

                <BoardView />
            </div>

            {/* Right Panel */}
            <Inspector />
        </main>
    );
}
