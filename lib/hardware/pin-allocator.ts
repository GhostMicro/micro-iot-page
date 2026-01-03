import { BoardDefinition, PinDefinition, PinCapability } from './board-defs';

export interface PinReservation {
    moduleId: string; // The ID of the module using this pin (e.g., 'dht22-1')
    pinGpio: number;
    function: string; // e.g., 'SDA', 'SCL', 'DATA', 'RELAY'
}

export interface AllocationResult {
    success: boolean;
    reservedPins: PinReservation[];
    error?: string;
}

export class PinAllocator {
    private board: BoardDefinition;
    private reservations: Map<number, PinReservation>; // GPIO -> Reservation

    constructor(board: BoardDefinition) {
        this.board = board;
        this.reservations = new Map();
    }

    // Reset all reservations
    public reset(): void {
        this.reservations.clear();
    }

    public getAvailablePins(requiredCap: PinCapability): PinDefinition[] {
        return this.board.pins.filter(pin => {
            if (this.reservations.has(pin.gpio)) return false;
            // Strict Capability Check
            return pin.capabilities.includes(requiredCap);
        });
    }

    /**
     * Reserve a specific pin for a module
     */
    public reservePin(gpio: number, moduleId: string, func: string): boolean {
        // If already reserved by SAME module, it's fine (update request?)
        if (this.reservations.has(gpio)) {
            const existing = this.reservations.get(gpio);
            if (existing?.moduleId === moduleId && existing.function === func) return true;
            return false; // Conflict!
        }

        // Check if pin exists on board
        const pinDef = this.board.pins.find(p => p.gpio === gpio);
        if (!pinDef) return false;

        this.reservations.set(gpio, { moduleId, pinGpio: gpio, function: func });
        return true;
    }

    /**
     * Auto-allocate a pin for a requirement
     * @param moduleId Module ID requesting component
     * @param capability functionality needed (e.g. 'digital-out', 'i2c')
     * @param preferSafe If true, avoid restricted pins
     */
    public allocate(moduleId: string, capability: PinCapability, preferSafe: boolean = true): number | null {
        let candidates = this.getAvailablePins(capability);

        // Sort candidates:
        // 1. Safe pins first (not restricted)
        // 2. ADC pins last if we just need digital (save ADC for analog sensors)
        // 3. Serial pins last

        candidates.sort((a, b) => {
            if (preferSafe) {
                if (a.restricted && !b.restricted) return 1;
                if (!a.restricted && b.restricted) return -1;
            }
            // Logic to preserve special pins if possible
            return 0;
        });

        if (candidates.length === 0) return null;

        const selected = candidates[0];
        this.reservations.set(selected.gpio, { moduleId, pinGpio: selected.gpio, function: capability });
        return selected.gpio;
    }

    // Use this for I2C if you want to share the bus
    public getSharedBus(busType: 'i2c' | 'spi'): number[] | null {
        // Logic to find if a bus is already active and return those pins
        // For now, return default board I2C if available or allocated
        if (busType === 'i2c') {
            // Check if default I2C is free or used by I2C
            const sda = this.board.defaultI2C.sda;
            const scl = this.board.defaultI2C.scl;

            // If reserved by 'i2c' by another module, we can share!
            // Implementation pending bus management logic
            return [sda, scl];
        }
        return null;
    }
}
