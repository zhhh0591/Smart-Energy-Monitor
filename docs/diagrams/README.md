# Wiring Diagrams

Fritzing-style SVG wiring diagrams for the ESP32 + INA219 DC energy monitoring project. They render directly in any browser and on GitHub.

| File | Description |
| --- | --- |
| [`phase1-wiring.svg`](./phase1-wiring.svg) | Phase 1 · Basic measurement: ESP32 + INA219 + DC fan + battery; load current flows in series through the INA219 (Vin+ → Vin−) |
| [`phase2-dataflow.svg`](./phase2-dataflow.svg) | Phase 2 · Data flow (no new hardware): INA219 → ESP32 (WiFi/MQTT) → MQTT broker → web dashboard |
| [`phase4-wiring.svg`](./phase4-wiring.svg) | Phase 4 · Relay control & protection: adds a relay (COM/NO) into the Phase 1 load path, switched by GPIO26 |
| [`assembly-3d.html`](./assembly-3d.html) | Interactive 3D assembly model (Three.js, fully self-contained single file). Open in any browser: drag to rotate, scroll to zoom, buttons toggle Phase 1 / Phase 4 wiring |

## Pin reference

| Signal | ESP32 | Peer | Wire color |
| --- | --- | --- | --- |
| Power | 3V3 | INA219 VCC (also relay VCC in Phase 4) | Red |
| Ground | GND | INA219 GND / relay GND / battery − (common ground) | Black |
| I²C clock | GPIO22 | INA219 SCL | Yellow |
| I²C data | GPIO21 | INA219 SDA | Blue |
| Relay control (Phase 4) | GPIO26 | Relay IN | Green |

**High-current path (thick red/black lines)**

- Phase 1: Battery+ → INA219 Vin+ → Vin− → fan red lead → fan black lead → Battery−
- Phase 4: Battery+ → INA219 Vin+ → Vin− → relay COM → NO → fan red lead → fan black lead → Battery−

Phases 2 and 3 are software/data-flow stages; their hardware wiring is identical to Phase 1.
