import { create } from 'zustand';
import { BoardDefinition, ESP32_DEVKIT_V1, ESP8266_NODEMCU } from './hardware/board-defs';
import { ModuleDefinition, SUPPORTED_MODULES } from '@/data/modules';
import { PinAllocator } from './hardware/pin-allocator';

export interface AddedModule {
    uuid: string; // Unique ID for this instance
    defId: string; // Definition ID (e.g., 'dht22')
    customLabel?: string;
    allocatedPins: Record<string, number>; // function -> gpio
}

interface ProjectState {
    board: BoardDefinition;
    modules: AddedModule[];
    wifiConfig: {
        ssid: string;
        pass: string;
        btName: string; // Only for ESP32
    };
    mqttConfig: {
        broker: string;
        port: number;
        deviceId: string;
        identity?: string; // Generated Mnemonic
        ghostPassData: {
            role: number;
            type: number;
            name: number;
            version: number;
            model: number;
            prodDate: number;
            actDate: number;
            expiryDate: number;
            sku: number;
        };
    };
    logs: string[];

    // Actions
    setBoard: (boardId: string) => void;
    addModule: (defId: string) => { success: boolean; error?: string };
    removeModule: (uuid: string) => void;
    updateWifi: (config: Partial<ProjectState['wifiConfig']>) => void;
    updateMqtt: (config: Partial<ProjectState['mqttConfig']>) => void;
    generateIdentity: () => Promise<void>;
    addLog: (msg: string) => void;
    clearLogs: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    board: ESP32_DEVKIT_V1, // Default
    modules: [],
    wifiConfig: { ssid: '', pass: '', btName: 'MyESP32' },
    mqttConfig: {
        broker: 'broker.hivemq.com',
        port: 1883,
        deviceId: 'micro_node_' + Math.floor(Math.random() * 1000),
        ghostPassData: {
            role: 0, type: 1, name: 1, version: 1, model: 1,
            prodDate: 1, actDate: 1, expiryDate: 1, sku: 1
        }
    },
    logs: [],

    setBoard: (boardId) => {
        const board = boardId === 'esp8266-nodemcu' ? ESP8266_NODEMCU : ESP32_DEVKIT_V1;
        // When switching board, we might need to re-allocate or warn.
        // For simplicity, we clear modules for now, or we could try to migrate.
        set({ board, modules: [] });
    },

    addModule: (defId) => {
        const { board, modules } = get();
        const def = SUPPORTED_MODULES.find(m => m.id === defId);
        if (!def) return { success: false, error: 'Module definition not found' };

        // 1. Reconstruct Allocator State
        const allocator = new PinAllocator(board);

        // Replay existing allocations
        for (const m of modules) {
            const mDef = SUPPORTED_MODULES.find(d => d.id === m.defId);
            if (!mDef) continue; // Should not happen

            // We need to know which pin function maps to which capability.
            // Simplified: we rely on order or explicit mapping in definition.
            // For now, let's assume 'requires' array order matches 'allocatedPins' keys (PIN_0, PIN_1...)

            // Actually, we should just reserve what is already in 'allocatedPins'
            for (const [func, pin] of Object.entries(m.allocatedPins)) {
                allocator.reservePin(pin, m.uuid, func);
            }
        }

        // 2. Try to allocate for NEW module
        const newUuid = crypto.randomUUID();
        const newAllocation: Record<string, number> = {};

        // Bus Logic (Simplified)
        if (def.defaultBus === 'i2c') {
            const bus = allocator.getSharedBus('i2c');
            if (bus) {
                // I2C is usually fixed pins on these boards or shared
                newAllocation['PIN_0'] = bus[0]; // SDA
                newAllocation['PIN_1'] = bus[1]; // SCL
                // Reserve them (allocator handles sharing logic if implemented, or just force reserve)
                allocator.reservePin(bus[0], newUuid, 'i2c');
                allocator.reservePin(bus[1], newUuid, 'i2c');
            } else {
                return { success: false, error: 'I2C Bus pins unavailable' };
            }
        } else {
            // General GPIO allocation
            for (let i = 0; i < def.requires.length; i++) {
                const req = def.requires[i];
                const pin = allocator.allocate(newUuid, req, true); // Prefer safe
                if (pin === null) {
                    return { success: false, error: `Not enough '${req}' pins available!` };
                }
                newAllocation[`PIN_${i}`] = pin;
            }
        }

        // 3. Commit
        set({
            modules: [...modules, {
                uuid: newUuid,
                defId: def.id,
                allocatedPins: newAllocation
            }]
        });

        return { success: true };
    },

    removeModule: (uuid) => {
        set(state => ({
            modules: state.modules.filter(m => m.uuid !== uuid)
        }));
    },

    updateWifi: (cfg) => set(state => ({ wifiConfig: { ...state.wifiConfig, ...cfg } })),
    updateMqtt: (cfg) => {
        set(state => ({
            mqttConfig: {
                ...state.mqttConfig,
                ...cfg,
                // If only partial ghostpass data is sent, deep merge it
                ghostPassData: cfg.ghostPassData ? { ...state.mqttConfig.ghostPassData, ...cfg.ghostPassData } : state.mqttConfig.ghostPassData
            }
        }))
    },

    generateIdentity: async () => {
        try {
            const { mqttConfig } = get();
            const res = await fetch('/api/sign', {
                method: 'POST',
                body: JSON.stringify(mqttConfig.ghostPassData)
            });
            const data = await res.json();
            if (data.phrase) {
                set(state => ({
                    mqttConfig: { ...state.mqttConfig, identity: data.phrase },
                    logs: [...state.logs, `GhostPass generated: ${data.phrase.substring(0, 20)}...`]
                }));
            } else {
                set(state => ({ logs: [...state.logs, `Error generating GhostPass: ${data.error}`] }));
            }
        } catch (e) {
            set(state => ({ logs: [...state.logs, `Network error generating identity`] }));
        }
    },

    addLog: (msg) => set(state => ({ logs: [...state.logs, msg].slice(-100) })), // Keep last 100
    clearLogs: () => set({ logs: [] })
}));
