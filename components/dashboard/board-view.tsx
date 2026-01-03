import { useProjectStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function BoardView() {
    const { board, modules } = useProjectStore();

    // Map pins to allocation status
    const getPinStatus = (gpio: number) => {
        for (const m of modules) {
            for (const [func, pin] of Object.entries(m.allocatedPins)) {
                if (pin === gpio) return { allocated: true, module: m.defId, func };
            }
        }
        return { allocated: false };
    };

    return (
        <div className="flex-1 h-full flex flex-col relative bg-gradient-to-br from-gray-900 to-black overflow-hidden p-8">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-full">
                {/* The Board PCB */}
                <div className="relative bg-black/80 border border-white/20 backdrop-blur rounded-3xl p-6 shadow-2xl w-[400px] min-h-[600px] flex flex-col items-center">
                    {/* Mounting Holes */}
                    <div className="absolute top-4 left-4 w-4 h-4 bg-black border border-white/20 rounded-full"></div>
                    <div className="absolute top-4 right-4 w-4 h-4 bg-black border border-white/20 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-4 h-4 bg-black border border-white/20 rounded-full"></div>
                    <div className="absolute bottom-4 right-4 w-4 h-4 bg-black border border-white/20 rounded-full"></div>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="text-white/40 font-mono text-xs mb-1">MICRO-IOT GEN</div>
                        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">{board.name}</h1>
                    </div>

                    {/* Chip */}
                    <div className="w-32 h-32 bg-neutral-800 border border-neutral-700 rounded-lg mb-10 flex items-center justify-center shadow-inner relative">
                        <div className="text-neutral-500 font-mono text-xs rotate-45">{board.mcu.toUpperCase()}</div>
                        <div className="absolute -bottom-6 w-full text-center text-[10px] text-white/30">WIFI + BT ENGINE</div>
                    </div>

                    {/* Pins Grid */}
                    <div className="w-full grid grid-cols-2 gap-x-16 gap-y-2 font-mono text-xs">
                        {board.pins.map((pin, i) => {
                            const status = getPinStatus(pin.gpio);
                            return (
                                <div key={pin.gpio} className={cn(
                                    "flex items-center gap-3 p-1 rounded transition-all cursor-help relative group",
                                    i % 2 === 0 ? "flex-row-reverse text-right" : "flex-row text-left",
                                    status.allocated ? "bg-cyan-500/10" : "hover:bg-white/5"
                                )}>
                                    {/* Pin Label */}
                                    <div className={cn(
                                        "flex-1",
                                        status.allocated ? "text-cyan-300" : "text-white/60",
                                        pin.restricted && !status.allocated && "text-red-400/60"
                                    )}>
                                        {pin.label} <span className="text-[10px] opacity-50">G{pin.gpio}</span>
                                    </div>

                                    {/* The Pin Hole */}
                                    <div className={cn(
                                        "min-w-3 min-h-3 w-3 h-3 rounded-full border border-white/20 ring-2 ring-transparent transition-all",
                                        status.allocated ? "bg-cyan-500 ring-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-neutral-900",
                                        pin.restricted && !status.allocated && "bg-red-900/50 border-red-500/30"
                                    )}></div>

                                    {/* Tooltip */}
                                    <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-black border border-white/20 px-2 py-1 rounded text-[10px] pointer-events-none opacity-0 group-hover:opacity-100 whitespace-nowrap z-20">
                                        {status.allocated ? `Used by ${status.module} (${status.func})` :
                                            pin.restricted ? `⚠️ Restricted: ${pin.restrictionReason}` :
                                                `Free (${pin.capabilities.join(', ')})`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
