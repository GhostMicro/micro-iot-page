export type PinCapability = 'digital-in' | 'digital-out' | 'analog-in' | 'analog-out' | 'pwm' | 'i2c' | 'spi' | 'uart' | 'power' | 'gnd';

export interface PinDefinition {
    gpio: number; // The GPIO number used in code
    label: string; // The label printed on the board (e.g., D1, RX)
    capabilities: PinCapability[];
    adcChannel?: number;
    restricted?: boolean; // If true, should ideally not be used or used with caution
    restrictionReason?: string; // e.g., "Boot High", "Connected to Flash"
    voltage?: '3.3V' | '5V' | 'VIN'; // For power pins
    // Default state at boot if critical
    bootState?: 'high' | 'low' | 'floating';
}

export interface BoardDefinition {
    id: string;
    name: string;
    mcu: 'esp8266' | 'esp32';
    pins: PinDefinition[];
    defaultI2C: { sda: number; scl: number };
    defaultSPI: { mosi: number; miso: number; clk: number; cs: number };
    flashSize?: number; // bytes
    maxCurrentTotal?: number; // mA (estimated LDO limit)
}

export const ESP8266_NODEMCU: BoardDefinition = {
    id: 'esp8266-nodemcu',
    name: 'NodeMCU (ESP8266)',
    mcu: 'esp8266',
    defaultI2C: { sda: 4, scl: 5 }, // D2, D1
    defaultSPI: { mosi: 13, miso: 12, clk: 14, cs: 15 }, // D7, D6, D5, D8
    maxCurrentTotal: 800, // AMS1117 3.3V
    pins: [
        { gpio: 16, label: 'D0', capabilities: ['digital-in', 'digital-out', 'pwm'], restricted: true, restrictionReason: 'High at Boot / Deep Sleep Wake' },
        { gpio: 5, label: 'D1', capabilities: ['digital-in', 'digital-out', 'pwm', 'i2c'] }, // SCL
        { gpio: 4, label: 'D2', capabilities: ['digital-in', 'digital-out', 'pwm', 'i2c'] }, // SDA
        { gpio: 0, label: 'D3', capabilities: ['digital-in', 'digital-out', 'pwm'], restricted: true, restrictionReason: 'Flash Button / Boot Mode (Must be High at Boot)' },
        { gpio: 2, label: 'D4', capabilities: ['digital-in', 'digital-out', 'pwm', 'uart'], restricted: true, restrictionReason: 'Built-in LED / Boot High' },
        { gpio: 14, label: 'D5', capabilities: ['digital-in', 'digital-out', 'pwm', 'spi'] }, // SCK
        { gpio: 12, label: 'D6', capabilities: ['digital-in', 'digital-out', 'pwm', 'spi'] }, // MISO
        { gpio: 13, label: 'D7', capabilities: ['digital-in', 'digital-out', 'pwm', 'spi', 'uart'] }, // MOSI / RXD2
        { gpio: 15, label: 'D8', capabilities: ['digital-in', 'digital-out', 'pwm', 'spi', 'uart'], restricted: true, restrictionReason: 'Boot Low (Must be Low at Boot)' },
        { gpio: 3, label: 'RX', capabilities: ['digital-in', 'digital-out', 'uart'], restricted: true, restrictionReason: 'RX Pin / High at Boot' },
        { gpio: 1, label: 'TX', capabilities: ['digital-in', 'digital-out', 'uart'], restricted: true, restrictionReason: 'TX Pin / High at Boot / Debug Output' },
        { gpio: 17, label: 'A0', capabilities: ['analog-in'], restricted: false } // ADC0
    ]
};

export const ESP32_DEVKIT_V1: BoardDefinition = {
    id: 'esp32-devkit-v1',
    name: 'ESP32 DevKit V1 (30 Pin)',
    mcu: 'esp32',
    defaultI2C: { sda: 21, scl: 22 },
    defaultSPI: { mosi: 23, miso: 19, clk: 18, cs: 5 },
    maxCurrentTotal: 800,
    pins: [
        // ADC2 (Cannot use when WiFi is on) - pins 0, 2, 4, 12-15, 25-27
        // ADC1 (Safe with WiFi) - pins 32-39
        { gpio: 34, label: 'D34', capabilities: ['digital-in', 'analog-in'], restricted: true, restrictionReason: 'Input Only' },
        { gpio: 35, label: 'D35', capabilities: ['digital-in', 'analog-in'], restricted: true, restrictionReason: 'Input Only' },
        { gpio: 32, label: 'D32', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'] },
        { gpio: 33, label: 'D33', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'] },
        { gpio: 25, label: 'D25', capabilities: ['digital-in', 'digital-out', 'analog-in', 'analog-out', 'pwm'] }, // DAC1
        { gpio: 26, label: 'D26', capabilities: ['digital-in', 'digital-out', 'analog-in', 'analog-out', 'pwm'] }, // DAC2
        { gpio: 27, label: 'D27', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'] },
        { gpio: 14, label: 'D14', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm', 'spi'] },
        { gpio: 12, label: 'D12', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'], restricted: true, restrictionReason: 'Boot Fail if Pulled High' },
        { gpio: 13, label: 'D13', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'] },
        { gpio: 15, label: 'D15', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'], restricted: true, restrictionReason: 'Boot Log / Must be Low' },
        { gpio: 2, label: 'D2', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'], restricted: true, restrictionReason: 'Onboard LED / Boot' },
        { gpio: 0, label: 'D0', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'], restricted: true, restrictionReason: 'Boot Button' },
        { gpio: 4, label: 'D4', capabilities: ['digital-in', 'digital-out', 'analog-in', 'pwm'] },
        { gpio: 16, label: 'RX2', capabilities: ['digital-in', 'digital-out', 'uart'] },
        { gpio: 17, label: 'TX2', capabilities: ['digital-in', 'digital-out', 'uart'] },
        { gpio: 5, label: 'D5', capabilities: ['digital-in', 'digital-out', 'pwm', 'spi'] }, // VSPI CS
        { gpio: 18, label: 'D18', capabilities: ['digital-in', 'digital-out', 'pwm', 'spi'] }, // VSPI CLK
        { gpio: 19, label: 'D19', capabilities: ['digital-in', 'digital-out', 'pwm', 'spi'] }, // VSPI MISO
        { gpio: 21, label: 'D21', capabilities: ['digital-in', 'digital-out', 'pwm', 'i2c'] }, // SDA
        { gpio: 3, label: 'RX0', capabilities: ['digital-in', 'digital-out', 'uart'], restricted: true, restrictionReason: 'USB Serial RX' },
        { gpio: 1, label: 'TX0', capabilities: ['digital-in', 'digital-out', 'uart'], restricted: true, restrictionReason: 'USB Serial TX' },
        { gpio: 22, label: 'D22', capabilities: ['digital-in', 'digital-out', 'pwm', 'i2c'] }, // SCL
        { gpio: 23, label: 'D23', capabilities: ['digital-in', 'digital-out', 'pwm', 'spi'] }, // VSPI MOSI
    ]
};
