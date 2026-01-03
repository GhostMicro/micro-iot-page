import { PinCapability } from "@/lib/hardware/board-defs";

export interface ModuleDefinition {
    id: string;
    name: string;
    description: string;
    category: 'environmental' | 'security' | 'actuator' | 'power' | 'identity' | 'display';
    requires: PinCapability[]; // Simple requirements
    powerConsumption: number; // mA
    library: string; // Arduino Library Name
    defaultBus?: 'i2c' | 'spi'; // If it uses a bus
    headerInclude: string; // e.g., <DHT.h>
    constructorCode: string;
    setupCode: string;
    loopCode?: string;

    // MQTT / GRIDS-IOT-V1 Config
    topicType?: 'telemetry' | 'command' | 'none'; // Does it send data or receive commands?
    telemetryField?: string; // e.g., 'temp' for {"temp": 25}
    telemetryCode?: string; // [NEW] Custom logic for reading/sending telemetry
    commandOn?: string; // e.g. "ON" -> digitalHigh
    commandOff?: string; // e.g. "OFF" -> digitalLow
    libraries?: string[]; // [NEW] List of library IDs from libraries.ts
}

export const SUPPORTED_MODULES: ModuleDefinition[] = [
    // --- 1. Environmental Sensors ---
    {
        id: 'dht22',
        name: 'DHT22 Temp/Hum',
        description: 'Measure temperature and relative humidity.',
        category: 'environmental',
        requires: ['digital-in'],
        powerConsumption: 2,
        library: 'DHT sensor library',
        headerInclude: '#include "DHT.h"',
        constructorCode: 'DHT dht_{{ID}}({{PIN_0}}, DHT22);',
        setupCode: 'dht_{{ID}}.begin();',
        topicType: 'telemetry',
        telemetryField: 'climate',
        telemetryCode: `    float t = dht_{{ID}}.readTemperature();
    float h = dht_{{ID}}.readHumidity();
    if(!isnan(t)) { sendTelemetry("{{FIELD}}", t); }`,
        libraries: ['dht', 'adafruit_sensor'],
    },
    {
        id: 'ds18b20',
        name: 'DS18B20 Temp (Waterproof)',
        description: 'Waterproof 1-Wire temperature sensor.',
        category: 'environmental',
        requires: ['digital-in'], // 1-Wire is digital
        powerConsumption: 1,
        library: 'OneWire, DallasTemperature',
        headerInclude: '#include <OneWire.h>\n#include <DallasTemperature.h>',
        constructorCode: 'OneWire oneWire_{{ID}}({{PIN_0}});\nDallasTemperature sensors_{{ID}}(&oneWire_{{ID}});',
        setupCode: 'sensors_{{ID}}.begin();',
        topicType: 'telemetry',
        telemetryField: 'temp_water',
        telemetryCode: `    sensors_{{ID}}.requestTemperatures();
    float t = sensors_{{ID}}.getTempCByIndex(0);
    if(t > -127) { sendTelemetry("{{FIELD}}", t); }`,
        libraries: ['onewire', 'dallastemp'],
    },
    {
        id: 'bme280',
        name: 'BME280 Env Sensor',
        description: 'Temp, Humidity, and Pressure I2C sensor.',
        category: 'environmental',
        requires: ['i2c'],
        defaultBus: 'i2c',
        powerConsumption: 4,
        library: 'Adafruit BME280 Library',
        headerInclude: '#include <Adafruit_BME280.h>',
        constructorCode: 'Adafruit_BME280 bme_{{ID}};',
        setupCode: 'if (!bme_{{ID}}.begin(0x76)) { Serial.println("BME280 fail"); }',
        topicType: 'telemetry',
        telemetryField: 'env',
        telemetryCode: `    sendTelemetry("temp", bme_{{ID}}.readTemperature());
    sendTelemetry("humid", bme_{{ID}}.readHumidity());
    sendTelemetry("press", bme_{{ID}}.readPressure()/100.0F);`,
        libraries: ['bme280', 'adafruit_sensor'],
    },
    {
        id: 'ldr',
        name: 'LDR Light Sensor',
        description: 'Photoresistor to measure light intensity.',
        category: 'environmental',
        requires: ['analog-in'],
        powerConsumption: 1,
        library: '',
        headerInclude: '',
        constructorCode: '// LDR on PIN_{{PIN_0}}',
        setupCode: 'pinMode({{PIN_0}}, INPUT);',
        topicType: 'telemetry',
        telemetryField: 'light_level',
        telemetryCode: `    sendTelemetry("{{FIELD}}", analogRead({{PIN_0}}));`,
    },
    {
        id: 'soil-moisture',
        name: 'Soil Moisture Sensor',
        description: 'Measure soil humidity.',
        category: 'environmental',
        requires: ['analog-in'],
        powerConsumption: 5,
        library: '',
        headerInclude: '',
        constructorCode: '// Soil Sensor on PIN_{{PIN_0}}',
        setupCode: 'pinMode({{PIN_0}}, INPUT);',
        topicType: 'telemetry',
        telemetryField: 'soil_moisture',
        telemetryCode: `    sendTelemetry("{{FIELD}}", analogRead({{PIN_0}}));`,
    },

    // --- 2. Security & Motion ---
    {
        id: 'pir-hc-sr501',
        name: 'PIR Motion (HC-SR501)',
        description: 'Detects infrared motion.',
        category: 'security',
        requires: ['digital-in'],
        powerConsumption: 0.1,
        library: '',
        headerInclude: '',
        constructorCode: '// PIR on PIN_{{PIN_0}}',
        setupCode: 'pinMode({{PIN_0}}, INPUT);',
        topicType: 'telemetry',
        telemetryField: 'motion_detected',
        telemetryCode: `    sendTelemetry("{{FIELD}}", digitalRead({{PIN_0}}));`,
    },
    {
        id: 'hc-sr04',
        name: 'Ultrasonic (HC-SR04)',
        description: 'Distance sensor.',
        category: 'security',
        requires: ['digital-out', 'digital-in'], // Trig, Echo
        powerConsumption: 15,
        library: '',
        headerInclude: '',
        constructorCode: '// Ultrasonic Trig: {{PIN_0}}, Echo: {{PIN_1}}',
        setupCode: 'pinMode({{PIN_0}}, OUTPUT); pinMode({{PIN_1}}, INPUT);',
        topicType: 'telemetry',
        telemetryField: 'distance_cm',
        telemetryCode: `    digitalWrite({{PIN_0}}, LOW); delayMicroseconds(2); digitalWrite({{PIN_0}}, HIGH); delayMicroseconds(10); digitalWrite({{PIN_0}}, LOW);
    long dur = pulseIn({{PIN_1}}, HIGH);
    sendTelemetry("{{FIELD}}", dur*0.034/2);`,
    },
    {
        id: 'mag-switch',
        name: 'Magnetic Door Switch',
        description: 'Detects open/close status.',
        category: 'security',
        requires: ['digital-in'], // Input Pullup usually
        powerConsumption: 0,
        library: '',
        headerInclude: '',
        constructorCode: '// Door Reed Switch on PIN_{{PIN_0}}',
        setupCode: 'pinMode({{PIN_0}}, INPUT_PULLUP);',
        topicType: 'telemetry',
        telemetryField: 'door_open',
        telemetryCode: `    sendTelemetry("{{FIELD}}", digitalRead({{PIN_0}}));`,
    },
    {
        id: 'rain-sensor',
        name: 'Rain Sensor',
        description: 'Detects rain drops.',
        category: 'environmental', // Or security?
        requires: ['analog-in'],
        powerConsumption: 5,
        library: '',
        headerInclude: '',
        constructorCode: 'const int rainPin_{{ID}} = {{PIN_0}};',
        setupCode: 'pinMode(rainPin_{{ID}}, INPUT);',
        topicType: 'telemetry',
        telemetryField: 'rain_level',
        telemetryCode: `    sendTelemetry("{{FIELD}}", analogRead({{PIN_0}}));`,
    },

    // --- 3. Actuators & Display ---
    {
        id: 'relay-1ch',
        name: 'Relay 1CH',
        description: 'Control high voltage AC.',
        category: 'actuator',
        requires: ['digital-out'],
        powerConsumption: 70,
        library: '',
        headerInclude: '',
        constructorCode: 'const int relayPin_{{ID}} = {{PIN_0}};',
        setupCode: 'pinMode(relayPin_{{ID}}, OUTPUT); digitalWrite(relayPin_{{ID}}, HIGH);', // Active Low usually, start OFF (High)
        topicType: 'command',
        commandOn: 'LOW',
        commandOff: 'HIGH',
    },
    {
        id: 'servo-sg90',
        name: 'Servo (SG90)',
        description: 'Generic servo motor.',
        category: 'actuator',
        requires: ['pwm'],
        powerConsumption: 200, // Peak
        library: 'ESP32Servo', // or Servo.h
        headerInclude: '#include <ESP32Servo.h>', // Assume ESP32 for now, simplify
        constructorCode: 'Servo servo_{{ID}}; const int servoPin_{{ID}} = {{PIN_0}};',
        setupCode: 'servo_{{ID}}.attach(servoPin_{{ID}});',
        topicType: 'command',
        libraries: ['esp32servo'],
    },
    {
        id: 'active-buzzer',
        name: 'Active Buzzer',
        description: 'Simple sound alarm.',
        category: 'actuator',
        requires: ['digital-out'],
        powerConsumption: 30,
        library: '',
        headerInclude: '',
        constructorCode: 'const int buzzerPin_{{ID}} = {{PIN_0}};',
        setupCode: 'pinMode(buzzerPin_{{ID}}, OUTPUT);',
        topicType: 'command',
        commandOn: 'HIGH',
        commandOff: 'LOW',
    },
    {
        id: 'ssd1306-i2c',
        name: 'OLED Display (128x64)',
        description: 'I2C OLED Screen.',
        category: 'display',
        requires: ['i2c'],
        defaultBus: 'i2c',
        powerConsumption: 20,
        library: 'Adafruit SSD1306',
        headerInclude: '#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>',
        constructorCode: 'Adafruit_SSD1306 display_{{ID}}(128, 64, &Wire, -1);',
        setupCode: 'if(!display_{{ID}}.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { Serial.println(F("SSD1306 fail")); }',
        topicType: 'none',
        libraries: ['ssd1306', 'gfx', 'busio'],
    },
    {
        id: 'lcd-1602-i2c',
        name: 'LCD 1602 (I2C)',
        description: '16x2 Character Display with I2C Backpack.',
        category: 'display',
        requires: ['i2c'],
        defaultBus: 'i2c',
        powerConsumption: 40,
        library: 'LiquidCrystal_I2C',
        headerInclude: '#include <LiquidCrystal_I2C.h>',
        constructorCode: 'LiquidCrystal_I2C lcd_{{ID}}(0x27, 16, 2);',
        setupCode: 'lcd_{{ID}}.init(); lcd_{{ID}}.backlight();',
        topicType: 'none',
        libraries: ['liquidcrystal_i2c'],
    },

    // --- 4. Power & Electricity ---
    {
        id: 'pzem-004t',
        name: 'PZEM-004T v3',
        description: 'AC Voltage, Current, Power monitor.',
        category: 'power',
        requires: ['uart'], // RX, TX
        powerConsumption: 10,
        library: 'PZEM004Tv30',
        headerInclude: '#include <PZEM004Tv30.h>',
        constructorCode: 'PZEM004Tv30 pzem_{{ID}}(Serial2, {{PIN_0}}, {{PIN_1}});', // Needs HW Serial usually or SoftSerial
        setupCode: '', // PZEM self-inits
        topicType: 'telemetry',
        telemetryField: 'power_ac',
        libraries: ['pzem004t'],
    },
    {
        id: 'voltage-sensor',
        name: 'DC Voltage Sensor',
        description: '0-25V DC Voltage Divider.',
        category: 'power',
        requires: ['analog-in'],
        powerConsumption: 1,
        library: '',
        headerInclude: '',
        constructorCode: 'const int voltPin_{{ID}} = {{PIN_0}};',
        setupCode: 'pinMode(voltPin_{{ID}}, INPUT);',
        topicType: 'telemetry',
        telemetryField: 'battery_v',
        telemetryCode: `    sendTelemetry("{{FIELD}}", analogRead({{PIN_0}}) * (25.0 / 1023.0));`, // Approximate conversion
    },

    // --- 5. Identity & Specialized ---
    {
        id: 'rfid-rc522',
        name: 'RFID RC522',
        description: '13.56MHz Card Reader.',
        category: 'identity',
        requires: ['spi', 'digital-out'], // SPI + Reset
        defaultBus: 'spi',
        powerConsumption: 30,
        library: 'MFRC522',
        headerInclude: '#include <SPI.h>\n#include <MFRC522.h>',
        constructorCode: 'MFRC522 mfrc522_{{ID}}({{PIN_4}}, {{PIN_3}}); // SS/SDA, RST', // Need to map SPI pins carefully
        setupCode: 'SPI.begin(); mfrc522_{{ID}}.PCD_Init();',
        topicType: 'telemetry',
        telemetryField: 'card_uid',
        libraries: ['mfrc522'],
    },
    // Fingerprint omitted for complexity in code-gen now, requires complex library callbacks
];
