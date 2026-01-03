export interface LibraryDefinition {
    id: string;
    name: string;
    description: string;
    author: string;
    url?: string; // GitHub or Arduino Ref
    managerName: string; // Name in Library Manager
}

export const SUPPORTED_LIBRARIES: Record<string, LibraryDefinition> = {
    // Core
    'pubsubclient': {
        id: 'pubsubclient',
        name: 'PubSubClient',
        description: 'A client library for simple MQTT messaging.',
        author: 'Nick O\'Leary',
        managerName: 'PubSubClient'
    },
    'arduinojson': {
        id: 'arduinojson',
        name: 'ArduinoJson',
        description: 'Efficient JSON serialization for embedded C++.',
        author: 'Benoit Blanchon',
        managerName: 'ArduinoJson'
    },

    // Sensors
    'dht': {
        id: 'dht',
        name: 'DHT Sensor Library',
        description: 'Arduino library for DHT11, DHT22, etc.',
        author: 'Adafruit',
        managerName: 'DHT sensor library'
    },
    'adafruit_sensor': {
        id: 'adafruit_sensor',
        name: 'Adafruit Unified Sensor',
        description: 'Required driver for many Adafruit sensors.',
        author: 'Adafruit',
        managerName: 'Adafruit Unified Sensor'
    },
    'onewire': {
        id: 'onewire',
        name: 'OneWire',
        description: 'Access 1-wire temperature sensors like DS18B20.',
        author: 'Paul Stoffregen',
        managerName: 'OneWire'
    },
    'dallastemp': {
        id: 'dallastemp',
        name: 'DallasTemperature',
        description: 'Arduino Library for Dallas Temperature ICs.',
        author: 'Miles Burton',
        managerName: 'DallasTemperature'
    },
    'bme280': {
        id: 'bme280',
        name: 'Adafruit BME280 Library',
        description: 'Library for BME280 humidity, temperature & pressure sensors.',
        author: 'Adafruit',
        managerName: 'Adafruit BME280 Library'
    },

    // Actuators & Display
    'esp32servo': {
        id: 'esp32servo',
        name: 'ESP32Servo',
        description: 'Servo library for ESP32.',
        author: 'Kevin Harrington',
        managerName: 'ESP32Servo'
    },
    'ssd1306': {
        id: 'ssd1306',
        name: 'Adafruit SSD1306',
        description: 'SSD1306 oled driver library.',
        author: 'Adafruit',
        managerName: 'Adafruit SSD1306'
    },
    'gfx': {
        id: 'gfx',
        name: 'Adafruit GFX Library',
        description: 'Core graphics library for displays.',
        author: 'Adafruit',
        managerName: 'Adafruit GFX Library'
    },
    'busio': {
        id: 'busio',
        name: 'Adafruit BusIO',
        description: 'I2C and SPI helper library.',
        author: 'Adafruit',
        managerName: 'Adafruit BusIO'
    },
    'liquidcrystal_i2c': {
        id: 'liquidcrystal_i2c',
        name: 'LiquidCrystal I2C',
        description: 'Library for I2C LCD displays.',
        author: 'Frank de Brabander',
        managerName: 'LiquidCrystal I2C'
    },

    // Power & Identity
    'pzem004t': {
        id: 'pzem004t',
        name: 'PZEM004Tv30',
        description: 'Library for PZEM-004T v3.0 Power Meter.',
        author: 'Mandulaj',
        managerName: 'PZEM004Tv30'
    },
    'mfrc522': {
        id: 'mfrc522',
        name: 'MFRC522',
        description: 'Library for MFRC522 RFID modules.',
        author: 'GithubCommunity',
        managerName: 'MFRC522'
    }
};
