# 3D-Printable Enclosure

Parametric OpenSCAD enclosure for the ESP32 + INA219 + relay energy monitor.
**All dimensions are placeholders based on typical modules** — measure your
actual boards and edit the `PARAMETERS` block at the top of
[`enclosure.scad`](./enclosure.scad), then re-export.

![Exploded view](./preview-assembly.png)

![Component layout](./preview-layout.png)

| File | Description |
| --- | --- |
| `enclosure.scad` | Parametric source (edit this) |
| `enclosure-base.stl` | Bottom shell, ready to print (placeholder dims) |
| `enclosure-lid.stl` | Lid, ready to print (placeholder dims) |
| `preview-*.png` | Rendered previews (exploded / layout / inside / print) |

## Features

- Base + screw-down lid (4× M3 self-tapping into corner posts, counterbored heads)
- Standoffs with pilot holes for ESP32 DevKit (4×), INA219 (2× diagonal), relay module (4×)
- USB opening in the left wall aligned with the ESP32
- Two Ø8 mm wire pass-throughs in the right wall (load/fan wires, battery wires)
- Ventilation slots in both long walls and the lid
- Engraved lid label (`lid_text` parameter, set `""` to disable)
- Lid lip with 0.3 mm fit clearance keeps the lid located on the box

## What to measure on your boards

| Parameter(s) | Measure |
| --- | --- |
| `esp_size`, `ina_size`, `rly_size` | PCB length × width |
| `*_hole_inset` | Mounting-hole centre distance from board corner |
| `esp_pos`, `ina_pos`, `rly_pos` | Where each board sits in the cavity (lower-left corner, mm) |
| `usb_w`, `usb_h`, `usb_z` | USB connector width/height and height above enclosure floor |
| `inner_z` | Tallest component (usually the relay cube) + wire clearance |
| `port_d`, `port1_y`, `port2_y` | Wire bundle diameter and port positions |

## Export

```sh
openscad -o enclosure-base.stl -D 'part="base"' enclosure.scad
openscad -o enclosure-lid.stl  -D 'part="lid"'  enclosure.scad
```

Set `part = "assembly"` for an exploded preview, `"print"` for the print layout.

## Suggested print settings

PETG or PLA · 0.2 mm layers · 3 perimeters · no supports needed
(base prints upright, lid prints outer-face-down as in the `print` layout).
