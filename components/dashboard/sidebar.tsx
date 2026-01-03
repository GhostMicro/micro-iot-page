import { useProjectStore } from "@/lib/store";
import { Copy, Trash2, Wifi } from "lucide-react";

export function Sidebar() {
    const { board, setBoard, wifiConfig, updateWifi, modules, removeModule, mqttConfig, generateIdentity } = useProjectStore();

    return (
        <aside className="w-80 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Micro-IoT
                </h2>
                <p className="text-xs text-white/50">Intelligent Generator</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Board Selection */}
                <section>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
                        Target Board
                    </label>
                    <select
                        value={board.id}
                        onChange={(e) => setBoard(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <option value="esp32-devkit-v1" className="bg-neutral-900 text-white">ESP32 DevKit V1</option>
                        <option value="esp8266-nodemcu" className="bg-neutral-900 text-white">NodeMCU (ESP8266)</option>
                    </select>
                </section>

                {/* Network Config */}
                <section className="space-y-3">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                        Connectivity
                    </label>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                            <Wifi size={16} className="text-white/40" />
                            <input
                                type="text"
                                placeholder="WiFi SSID"
                                value={wifiConfig.ssid}
                                onChange={(e) => updateWifi({ ssid: e.target.value })}
                                className="bg-transparent w-full text-sm text-white placeholder-white/20 focus:outline-none"
                            />
                        </div>
                        <input
                            type="password"
                            placeholder="WiFi Password"
                            value={wifiConfig.pass}
                            onChange={(e) => updateWifi({ pass: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white placeholder-white/20 focus:outline-none"
                        />
                        {board.mcu === 'esp32' && (
                            <input
                                type="text"
                                placeholder="Bluetooth Name"
                                value={wifiConfig.btName}
                                onChange={(e) => updateWifi({ btName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-cyan-300 placeholder-white/20 focus:outline-none"
                            />
                        )}
                    </div>
                </section>

                {/* MQTT Config (GRIDS-IOT-V1) */}
                <section className="space-y-3">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                        MQTT Broker
                    </label>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Broker URL (e.g. broker.hivemq.com)"
                            value={mqttConfig.broker}
                            onChange={(e) => useProjectStore.getState().updateMqtt({ broker: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-cyan-300 placeholder-white/20 focus:outline-none"
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Port"
                                value={mqttConfig.port}
                                onChange={(e) => useProjectStore.getState().updateMqtt({ port: Number(e.target.value) })}
                                className="w-20 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white placeholder-white/20 focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Device ID"
                                value={mqttConfig.deviceId}
                                onChange={(e) => useProjectStore.getState().updateMqtt({ deviceId: e.target.value })}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-yellow-300 placeholder-white/20 focus:outline-none"
                            />
                        </div>


                    </div>
                </section>

                {/* Active Modules */}
                <section>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                            Active Modules ({modules.length})
                        </label>
                    </div>

                    <div className="space-y-2">
                        {modules.length === 0 && (
                            <div className="text-center p-4 border border-dashed border-white/10 rounded-lg text-white/30 text-xs">
                                No modules added
                            </div>
                        )}
                        {modules.map(m => (
                            <div key={m.uuid} className="group flex items-start justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-colors">
                                <div>
                                    <div className="text-sm font-medium text-white">{m.defId}</div>
                                    <div className="text-xs text-white/40 font-mono mt-1">
                                        {Object.entries(m.allocatedPins).map(([k, v]) => (
                                            <span key={k} className="mr-2">{k.replace('PIN_', 'P')}:{v}</span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeModule(m.uuid)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 flex gap-2">
                <button
                    onClick={() => {
                        const data = JSON.stringify(useProjectStore.getState(), null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `micro_iot_project.json`;
                        a.click();
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-2 rounded text-xs font-medium transition-colors border border-white/5"
                >
                    Save Project
                </button>
                <label className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-2 rounded text-xs font-medium transition-colors border border-white/5 text-center cursor-pointer">
                    Load Project
                    <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                try {
                                    const json = JSON.parse(ev.target?.result as string);
                                    if (json.board && json.modules) {
                                        useProjectStore.setState(json);
                                    } else {
                                        alert("Invalid project file");
                                    }
                                } catch (err) {
                                    alert("Failed to parse project file");
                                }
                            };
                            reader.readAsText(file);
                        }}
                    />
                </label>
            </div>
        </aside >
    );
}
