import { SUPPORTED_MODULES } from "@/data/modules";
import { useProjectStore } from "../store";

// Helper to get raw state in a non-hook context
type State = ReturnType<typeof useProjectStore.getState>;

export function generateArduinoCode(state: State): string {
  const { board, modules, wifiConfig, mqttConfig } = state;
  const isESP32 = board.mcu === 'esp32';

  const includes = new Set<string>();
  const globals: string[] = [];
  const setups: string[] = [];
  const loops: string[] = [];

  // MQTT & Info Globals
  includes.add('#include <PubSubClient.h>');
  includes.add('#include <ArduinoJson.h>'); // V6
  includes.add('#include <ArduinoOTA.h>'); // OTA Support

  globals.push('WiFiClient espClient;');
  globals.push('PubSubClient client(espClient);');
  globals.push(`const char* mqtt_server = "${mqttConfig.broker}";`);
  globals.push(`const int mqtt_port = ${mqttConfig.port};`);
  globals.push(`const char* device_id = "${mqttConfig.deviceId}";`);

  // Identity Injection
  const realIdentity = mqttConfig.identity || "UNREGISTERED-DEV-KEY";
  globals.push(`const char* ghost_identity = "${realIdentity}"; // Signed Identity`);

  // 1. Core Includes
  if (isESP32) {
    includes.add('#include <WiFi.h>');
    includes.add('#include <ESPmDNS.h>');
    // Bluetooth removed as per expert recommendation (unused)
  } else {
    includes.add('#include <ESP8266WiFi.h>');
    includes.add('#include <ESP8266mDNS.h>');
  }

  // 2. Process Modules
  let discoveryModules: string[] = [];

  modules.forEach(m => {
    const def = SUPPORTED_MODULES.find(d => d.id === m.defId);
    if (!def) return;

    // Collect for Discovery JSON
    discoveryModules.push(def.id);

    // Includes
    if (def.headerInclude) {
      def.headerInclude.split('\n').forEach(inc => includes.add(inc.trim()));
    }

    // Configuration Replacement
    const idSafe = m.uuid.split('-')[0];
    let constructor = def.constructorCode.replace(/{{ID}}/g, idSafe);
    let setup = def.setupCode.replace(/{{ID}}/g, idSafe);
    let loop = def.loopCode ? def.loopCode.replace(/{{ID}}/g, idSafe) : '';

    for (const [key, gpio] of Object.entries(m.allocatedPins)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      constructor = constructor.replace(regex, String(gpio));
      setup = setup.replace(regex, String(gpio));
      if (loop) loop = loop.replace(regex, String(gpio));
    }

    globals.push(constructor);
    setups.push(`  // Setup ${def.name}\n  ${setup}`);
    if (loop) loops.push(`  // Loop ${def.name}\n  ${loop}`);

    // Telemetry Logic (in loop)
    if (def.topicType === 'telemetry' && def.telemetryField) {
      // Generic Template-based Telemetry
      let readLogic = def.telemetryCode || '';

      if (readLogic) {
        // ID Replacement
        readLogic = readLogic.replace(/{{ID}}/g, idSafe);
        readLogic = readLogic.replace(/{{FIELD}}/g, def.telemetryField || 'value');

        // Pin Replacement
        for (const [key, gpio] of Object.entries(m.allocatedPins)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          readLogic = readLogic.replace(regex, String(gpio));
        }

        loops.push(`  // Telemetry ${def.name}\n  static unsigned long last_${idSafe} = 0;\n  if(millis() - last_${idSafe} > 5000) {\n${readLogic}\n    last_${idSafe} = millis();\n  }`);
      }
    }
  });

  // 3. Assemble Code
  const lines: string[] = [];

  //Header
  lines.push(`/** GRIDS-IOT-V1 Auto-Generated Code */`);
  lines.push(`#include <Arduino.h>`);
  includes.forEach(inc => lines.push(inc));
  lines.push('');

  // Network Config
  lines.push(`const char* ssid = "${wifiConfig.ssid}";`);
  lines.push(`const char* password = "${wifiConfig.pass}";`);
  lines.push('');

  // Globals
  globals.forEach(g => lines.push(g));
  lines.push('');

  // Helper Functions
  lines.push(`
void sendTelemetry(String key, float value) {
  JsonDocument doc; // V7 Automatic Sizing
  doc[key] = value;
  doc["unit"] = "raw"; 
  char buffer[256];
  serializeJson(doc, buffer);
  String topic = String("grids/") + device_id + "/tele/" + key;
  client.publish(topic.c_str(), buffer);
}

void publishDiscovery() {
  JsonDocument doc; // V7 Automatic Sizing
    doc["sig"] = "GRIDS-IOT-V1";
    doc["device_id"] = device_id;
    doc["uid"] = ghost_identity; 
    doc["board"] = "${board.id}";
    doc["ver"] = "1.0.0";
    
    JsonArray mods = doc.createNestedArray("modules");
    ${discoveryModules.map(m => `mods.add("${m}");`).join('\n    ')}

    char buffer[1024];
    serializeJson(doc, buffer);
    String topic = String("grids/discovery/") + device_id;
    client.publish(topic.c_str(), buffer);
}

void callback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.print("[MQTT] "); Serial.print(topic); Serial.print(": "); Serial.println(msg);

  // Discovery Broadcast Response
  if (String(topic) == "grids/broadcast/discover" && msg == "SCAN") {
    publishDiscovery();
  }

  // Command Handling
  String topicStr = String(topic);
  if (topicStr.startsWith(String("grids/") + device_id + "/cmnd/")) {
     String mod = topicStr.substring(topicStr.lastIndexOf('/')+1);
     
     ${modules.filter(m => {
    const def = SUPPORTED_MODULES.find(d => d.id === m.defId);
    return def?.topicType === 'command';
  }).map(m => {
    const def = SUPPORTED_MODULES.find(d => d.id === m.defId);
    const idSafe = m.uuid.split('-')[0];
    if (def?.id.includes('servo')) {
      return `if (mod == "servo_sg90") { int val = msg.toInt(); servo_${idSafe}.write(val); }`;
    } else {
      return `if (mod == "${def?.id}" || mod == "${def?.telemetryField || 'switch'}") { 
                if(msg == "ON") digitalWrite(${m.allocatedPins['PIN_0']}, ${def?.commandOn || 'HIGH'}); 
                if(msg == "OFF") digitalWrite(${m.allocatedPins['PIN_0']}, ${def?.commandOff || 'LOW'}); 
                client.publish((String("grids/") + device_id + "/stat/" + mod).c_str(), msg.c_str());
             }`;
    }
  }).join('\n    ')}
  }
}

void setupOTA() {
  ArduinoOTA.setHostname(device_id);
  ArduinoOTA.onStart([]() { Serial.println("Start updating"); });
  ArduinoOTA.onEnd([]() { Serial.println("\\nEnd"); });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
  });
  ArduinoOTA.begin();
}

boolean reconnect() {
  if (client.connect(device_id, NULL, NULL, (String("grids/") + device_id + "/status").c_str(), 1, true, "offline")) {
    Serial.println("MQTT Connected");
    client.publish((String("grids/") + device_id + "/status").c_str(), "online", true);
    client.subscribe((String("grids/") + device_id + "/cmnd/#").c_str());
    client.subscribe("grids/broadcast/discover");
    publishDiscovery();
    return true;
  }
  return false;
}
`);

  // Setup
  lines.push('void setup() {');
  lines.push('  Serial.begin(115200);');
  lines.push('  ');
  lines.push('  // Connect WiFi (Timeout 10s)');
  lines.push('  WiFi.mode(WIFI_STA);');
  lines.push('  WiFi.begin(ssid, password);');
  lines.push('  int try_wifi = 0;');
  lines.push('  while (WiFi.status() != WL_CONNECTED && try_wifi < 20) { delay(500); Serial.print("."); try_wifi++; }');
  lines.push('  if(WiFi.status() == WL_CONNECTED) Serial.println("\\nWiFi Connected");');
  lines.push('  else Serial.println("\\nWiFi Timeout");');
  lines.push('');
  lines.push('  setupOTA();');
  lines.push('  client.setServer(mqtt_server, mqtt_port);');
  lines.push('  client.setCallback(callback);');
  lines.push('');

  setups.forEach(s => lines.push(s));
  lines.push('}');
  lines.push('');

  // Loop (Non-Blocking)
  lines.push('unsigned long lastReconnect = 0;');
  lines.push('void loop() {');
  lines.push('  ArduinoOTA.handle();');
  lines.push('  ');
  lines.push('  if (!client.connected()) {');
  lines.push('    unsigned long now = millis();');
  lines.push('    if (now - lastReconnect > 5000) {');
  lines.push('      lastReconnect = now;');
  lines.push('      if (reconnect()) { lastReconnect = 0; }');
  lines.push('    }');
  lines.push('  } else {');
  lines.push('    client.loop();');
  lines.push('  }');
  lines.push('  ');
  loops.forEach(l => lines.push(l));
  lines.push('}');

  return lines.join('\n');
}
