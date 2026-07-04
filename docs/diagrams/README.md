# 接线图 / Wiring Diagrams

ESP32 + INA219 直流电能监测项目的接线示意图（Fritzing 风格 SVG，可直接在浏览器或 GitHub 中查看）。

| 文件 | 说明 |
| --- | --- |
| [`phase1-wiring.svg`](./phase1-wiring.svg) | Phase 1 · 基础测量：ESP32 + INA219 + 直流风扇 + 电池，负载电流串联流经 INA219（Vin+ → Vin−） |
| [`phase2-dataflow.svg`](./phase2-dataflow.svg) | Phase 2 · 数据流示意（无新增硬件）：INA219 → ESP32 (WiFi/MQTT) → MQTT Broker → 网页仪表盘 |
| [`phase4-wiring.svg`](./phase4-wiring.svg) | Phase 4 · 继电器控制与保护：在 Phase 1 基础上串入继电器（COM/NO），GPIO26 控制通断 |

## 引脚速查

| 信号 | ESP32 | 对端 | 线色 |
| --- | --- | --- | --- |
| 电源 | 3V3 | INA219 VCC（Phase 4 同时供继电器 VCC） | 红 |
| 地 | GND | INA219 GND / 继电器 GND / 电池−（共地） | 黑 |
| I²C 时钟 | GPIO22 | INA219 SCL | 黄 |
| I²C 数据 | GPIO21 | INA219 SDA | 蓝 |
| 继电器控制（Phase 4） | GPIO26 | Relay IN | 绿 |

**大电流路径（粗红/粗黑线）**

- Phase 1：电池+ → INA219 Vin+ → Vin− → 风扇红线 → 风扇黑线 → 电池−
- Phase 4：电池+ → INA219 Vin+ → Vin− → 继电器 COM → NO → 风扇红线 → 风扇黑线 → 电池−

Phase 2 与 Phase 3 为软件/数据流阶段，硬件接线与 Phase 1 相同。
