/*
 * Parametric enclosure — ESP32 + INA219 + Relay DC energy monitor
 * ---------------------------------------------------------------
 * Units: mm.  All dimensions are PLACEHOLDERS based on typical modules;
 * edit the PARAMETERS block once real measurements are available.
 *
 * Render/export:
 *   part = "assembly"  exploded view (preview)
 *   part = "base"      bottom shell   -> export STL
 *   part = "lid"       top lid        -> export STL
 *   part = "print"     both parts laid out for the printer bed
 *
 * CLI export:
 *   openscad -o base.stl -D 'part="base"' enclosure.scad
 *   openscad -o lid.stl  -D 'part="lid"'  enclosure.scad
 */

part = "assembly"; // "base" | "lid" | "print" | "assembly"

/* ===================== PARAMETERS ===================== */

/* ---- shell ---- */
wall      = 2.4;   // side wall thickness
floor_t   = 2.2;   // bottom thickness
lid_t     = 2.6;   // lid plate thickness
corner_r  = 4;     // outer corner radius
inner_x   = 125;   // cavity length  (X)
inner_y   = 80;    // cavity width   (Y)
inner_z   = 30;    // cavity depth above floor (fits relay cube ~19 mm + wires)
fit_clr   = 0.30;  // lid lip fit clearance (per side)
lip_h     = 3.0;   // lid lip depth into the cavity
lip_t     = 2.0;   // lid lip thickness

/* ---- lid screw posts (corners) ---- */
post_d       = 8;    // post diameter
post_inset   = 5;    // post centre inset from cavity corner
post_hole_d  = 2.6;  // pilot hole for M3 self-tapping screw
lid_screw_d  = 3.4;  // through hole in lid
lid_cbore_d  = 6.5;  // countersink/counterbore diameter
lid_cbore_h  = 1.5;  // counterbore depth

/* ---- PCBs: [lower-left x, lower-left y] in cavity coords ---- */
/* ESP32 DevKit (38-pin, typical 51.0 x 26.5, USB on -X short edge) */
esp_pos  = [8, 27];   esp_size = [51.0, 26.5];  esp_hole_inset = 2.5;
/* INA219 breakout (Adafruit-style 25.4 x 20.3, 2 diagonal holes)   */
ina_pos  = [70, 52];  ina_size = [25.4, 20.3];  ina_hole_inset = 2.5;
/* 1-channel relay module (typical 50 x 26, 4 corner holes)         */
rly_pos  = [68, 10];  rly_size = [50.0, 26.0];  rly_hole_inset = 2.5;

/* ---- PCB standoffs ---- */
standoff_h      = 4;    // PCB bottom clearance
standoff_d      = 6;
standoff_hole_d = 2.0;  // pilot for M2/M2.5 self-tapping screw

/* ---- openings ---- */
usb_w = 13;  usb_h = 8;  usb_z = 6.5; // USB slot (left wall, centred on ESP32), z = bottom above outer floor
port_d   = 8;                        // wire pass-through holes (right wall)
port1_y  = 23;                       // load / fan wires   (aligned with relay bay)
port2_y  = 62;                       // battery wires      (aligned with INA219 bay)
port_z   = 12;                       // hole centre above outer floor

/* ---- ventilation ---- */
vent_w = 2.2;  vent_h = 14;  vent_n = 10;  vent_pitch = 6;  vent_z = 8;
lid_vent_cols = 6;  lid_vent_rows = 2;  lid_vent_l = 16;  lid_vent_w = 2.2;

/* ---- cosmetics ---- */
lid_text      = "ENERGY MON";
lid_text_size = 7;
lid_text_deep = 0.8;

/* ===================== derived ===================== */
outer_x = inner_x + 2*wall;
outer_y = inner_y + 2*wall;
outer_z = floor_t + inner_z;          // base height (lid sits on top)
icorner_r = max(corner_r - wall, 0.8);
$fs = 0.5; $fa = 6;

/* ===================== primitives ===================== */
module rbox(x, y, z, r) {             // rounded-corner box, corner at origin
  linear_extrude(height = z)
    translate([r, r]) offset(r = r) square([x - 2*r, y - 2*r]);
}

module standoff(h) {
  hole_len = h + floor_t - 1;                  // pilot hole, stops 1 mm above outer floor
  difference() {
    cylinder(d = standoff_d, h = h + 0.2);
    translate([0, 0, h + 0.2 - hole_len])
      cylinder(d = standoff_hole_d, h = hole_len + 0.01);
  }
}

module standoffs4(pos, size, inset) {  // 4 corner standoffs
  for (dx = [inset, size[0]-inset], dy = [inset, size[1]-inset])
    translate([pos[0]+dx, pos[1]+dy, 0]) standoff(standoff_h);
}

module standoffs2(pos, size, inset) {  // 2 diagonal standoffs (small breakouts)
  translate([pos[0]+inset,          pos[1]+inset,          0]) standoff(standoff_h);
  translate([pos[0]+size[0]-inset,  pos[1]+size[1]-inset,  0]) standoff(standoff_h);
}

module wall_vents(y_wall) {            // vertical slot row through a Y wall
  row_w = (vent_n-1)*vent_pitch;
  for (i = [0 : vent_n-1])
    translate([wall + inner_x/2 - row_w/2 + i*vent_pitch - vent_w/2,
               y_wall - 1, floor_t + vent_z])
      cube([vent_w, wall + 2, vent_h]);
}

/* ===================== base ===================== */
module base() {
  difference() {
    rbox(outer_x, outer_y, outer_z, corner_r);
    translate([wall, wall, floor_t])
      rbox(inner_x, inner_y, inner_z + 1, icorner_r);

    /* USB slot, left wall, centred on the ESP32 */
    translate([-1, wall + esp_pos[1] + esp_size[1]/2 - usb_w/2, usb_z])
      cube([wall + 2, usb_w, usb_h]);

    /* wire ports, right wall */
    for (py = [port1_y, port2_y])
      translate([outer_x - wall - 1, wall + py, port_z])
        rotate([0, 90, 0]) cylinder(d = port_d, h = wall + 2);

    /* vents, front + back walls */
    wall_vents(0);
    wall_vents(outer_y - wall);
  }

  /* lid screw posts */
  for (px = [post_inset, inner_x - post_inset], py = [post_inset, inner_y - post_inset])
    translate([wall + px, wall + py, floor_t - 0.2])
      difference() {
        cylinder(d = post_d, h = inner_z + 0.2);
        translate([0, 0, inner_z - 12]) cylinder(d = post_hole_d, h = 12.5);
      }

  /* PCB standoffs */
  translate([wall, wall, floor_t - 0.2]) {
    standoffs4(esp_pos, esp_size, esp_hole_inset);
    standoffs2(ina_pos, ina_size, ina_hole_inset);
    standoffs4(rly_pos, rly_size, rly_hole_inset);
  }
}

/* ===================== lid ===================== */
/* modelled with the plate bottom at z=0, lip going down (as assembled) */
module lid() {
  /* plate */
  difference() {
    rbox(outer_x, outer_y, lid_t, corner_r);

    /* screw holes + counterbores (match post centres) */
    for (px = [post_inset, inner_x - post_inset], py = [post_inset, inner_y - post_inset]) {
      translate([wall + px, wall + py, -0.5])
        cylinder(d = lid_screw_d, h = lid_t + 1);
      translate([wall + px, wall + py, lid_t - lid_cbore_h])
        cylinder(d = lid_cbore_d, h = lid_cbore_h + 0.5);
    }

    /* lid vents */
    grid_w = (lid_vent_cols-1)*vent_pitch;
    for (i = [0 : lid_vent_cols-1], j = [0 : lid_vent_rows-1])
      translate([outer_x/2 - grid_w/2 + i*vent_pitch - lid_vent_w/2,
                 outer_y/2 - (lid_vent_rows*lid_vent_l + (lid_vent_rows-1)*4)/2
                   + j*(lid_vent_l + 4),
                 -0.5])
        cube([lid_vent_w, lid_vent_l, lid_t + 1]);

    /* engraved label */
    if (lid_text != "")
      translate([outer_x/2, outer_y - 16, lid_t - lid_text_deep])
        linear_extrude(lid_text_deep + 0.1)
          text(lid_text, size = lid_text_size, halign = "center", valign = "center",
               font = "Liberation Sans:style=Bold");
  }

  /* lip ring (slides inside the cavity walls) */
  translate([0, 0, -lip_h + 0.001])
    difference() {
      translate([wall + fit_clr, wall + fit_clr, 0])
        rbox(inner_x - 2*fit_clr, inner_y - 2*fit_clr, lip_h, icorner_r);
      translate([wall + fit_clr + lip_t, wall + fit_clr + lip_t, -0.5])
        rbox(inner_x - 2*fit_clr - 2*lip_t, inner_y - 2*fit_clr - 2*lip_t, lip_h + 1, icorner_r);
      /* keep the lip clear of the corner posts */
      for (px = [post_inset, inner_x - post_inset], py = [post_inset, inner_y - post_inset])
        translate([wall + px, wall + py, -0.5])
          cylinder(d = post_d + 2*fit_clr + 1, h = lip_h + 1);
    }
}

/* ===================== output ===================== */
if (part == "base")  base();
if (part == "lid")   lid();

if (part == "assembly") {
  color("#8ecae6") base();
  color("#e9edf2") translate([0, 0, outer_z + 14]) lid();   // exploded
}

if (part == "print") {
  base();
  /* lid printed outer-face-down */
  translate([0, outer_y + 12 + outer_y, lid_t])
    rotate([180, 0, 0]) lid();
}

/* ---- documentation view: base with dummy PCBs in their bays ---- */
module dummy_board(pos, size, name, c, tsize) {
  color(c, 0.9) translate([pos[0], pos[1], 0]) cube([size[0], size[1], 1.6]);
  color("white") translate([pos[0]+size[0]/2, pos[1]+size[1]/2, 1.6])
    linear_extrude(0.5)
      text(name, size = tsize, halign = "center", valign = "center",
           font = "Liberation Sans:style=Bold");
}

module ground_label(x, y, name, tsize=5) {
  color("#334155") translate([x, y, 0.01]) linear_extrude(0.4)
    text(name, size = tsize, halign = "center", valign = "center",
         font = "Liberation Sans:style=Bold");
}

if (part == "layout") {
  color("#b9c8d4") base();
  translate([wall, wall, floor_t + standoff_h]) {
    dummy_board(esp_pos, esp_size, "ESP32", "SeaGreen", 7);
    dummy_board(ina_pos, ina_size, "INA219", "Purple", 4.5);
    dummy_board(rly_pos, rly_size, "RELAY", "RoyalBlue", 6);
    /* relay cube silhouette */
    color("SkyBlue", 0.55) translate([rly_pos[0]+4, rly_pos[1]+5, 1.6])
      cube([19, 15, 16]);
  }
  /* feature labels on the ground around the box */
  ground_label(-16, wall + esp_pos[1] + esp_size[1]/2, "USB");
  ground_label(outer_x + 22, wall + port1_y - 6, "FAN /");
  ground_label(outer_x + 22, wall + port1_y - 14, "LOAD");
  ground_label(outer_x + 24, wall + port2_y - 6, "BATTERY");
  ground_label(outer_x/2, -12, "VENTS");
}
