/*
 * "Unibody" enclosure — ESP32 + INA219 + Relay DC energy monitor
 * ---------------------------------------------------------------
 * Design language: one-piece top shell with large plan radii and a
 * soft rounded top edge (no visible fasteners), flat bottom plate
 * screwed from below, screws hidden under adhesive rubber feet,
 * all ventilation on the underside, subtle front wordmark.
 *
 * Units: mm.  All dimensions are PLACEHOLDERS based on typical
 * modules; edit the PARAMETERS block once real measurements exist.
 *
 * part = "assembly"  exploded preview
 * part = "beauty"    closed box, as on the desk
 * part = "layout"    bottom plate + dummy PCBs (documentation)
 * part = "shell"     top shell     -> export STL
 * part = "plate"     bottom plate  -> export STL
 * part = "print"     both parts in print orientation
 *
 * CLI export:
 *   openscad -o enclosure-shell.stl -D 'part="shell"' enclosure.scad
 *   openscad -o enclosure-plate.stl -D 'part="plate"' enclosure.scad
 */

part = "assembly";

/* ===================== PARAMETERS ===================== */

/* ---- shell ---- */
wall     = 2.6;   // wall thickness
top_t    = 3.0;   // top face thickness
plate_t  = 2.5;   // bottom plate thickness
rp       = 9;     // plan (vertical-edge) corner radius  — the "Apple" radius
re       = 2.8;   // top edge roll-over radius
inner_x  = 125;   // cavity length (X)
inner_y  = 80;    // cavity width  (Y)
inner_z  = 28;    // cavity height above the plate (relay cube + clearance)
clr      = 0.25;  // plate-to-rebate fit clearance (per side)
rebate_w = 1.3;   // plate rebate depth into the wall

/* ---- bottom fasteners (hidden under rubber feet) ---- */
boss_d      = 9;    // corner boss diameter
boss_off    = 6;    // boss centre offset from cavity corner (overlaps the rounded wall)
boss_hole_d = 2.6;  // pilot for M3 self-tapping screw
screw_d     = 3.4;  // through hole in plate
csk_d       = 6.8;  // countersink diameter (flat-head M3)
csk_h       = 1.7;  // countersink depth
foot_d      = 10;   // recess for adhesive rubber foot (covers the screw)
foot_h      = 0.6;  // recess depth

/* ---- PCBs: [lower-left x, lower-left y] in cavity coords ---- */
esp_pos  = [8, 27];   esp_size = [51.0, 26.5];  esp_hole_inset = 2.5;
ina_pos  = [70, 52];  ina_size = [25.4, 20.3];  ina_hole_inset = 2.5;
rly_pos  = [68, 11];  rly_size = [50.0, 26.0];  rly_hole_inset = 2.5;

standoff_h      = 4;
standoff_d      = 6;
standoff_hole_d = 2.0;

/* ---- openings ---- */
usb_w = 13;  usb_h = 8;  usb_z = 5;  usb_r = 2;  // left wall; usb_z = slot bottom above plate top
port_d  = 8;                                     // wire pass-throughs, right wall
port1_y = 23;                                    // load / fan wires
port2_y = 62;                                    // battery wires
port_z  = 10;                                    // hole centre above plate top

/* ---- underside ventilation (invisible from above) ---- */
slot_w = 2.5;  slot_l = 14;  slot_pitch = 6;

/* ---- wordmark, engraved low on the front wall ---- */
wordmark      = "ENERGY MON";
wm_size       = 4.2;
wm_deep       = 0.6;
wm_z          = 6.5;    // text centreline above shell bottom

/* ===================== derived ===================== */
outer_x = inner_x + 2*wall;
outer_y = inner_y + 2*wall;
H       = plate_t + inner_z + top_t;   // overall height
rp_i    = rp - wall;                   // cavity plan radius
rebate_h = plate_t + 0.2;
$fs = 0.6; $fa = 5;

/* ===================== primitives ===================== */
/* corner column: cylinder with a rolled-over top edge */
module rounded_col(r, edge, h) {
  cylinder(r = r, h = h - edge);
  translate([0, 0, h - edge]) {
    rotate_extrude() translate([r - edge, 0]) circle(r = edge);
    cylinder(r = r - edge, h = edge);
  }
}

/* rounded-plan solid with rolled top edge, corner at origin */
module rsolid(x, y, h, r, edge) {
  hull()
    for (cx = [r, x - r], cy = [r, y - r])
      translate([cx, cy, 0]) rounded_col(r, edge, h);
}

module standoff(h) {
  hole_len = h + plate_t - 1;
  difference() {
    cylinder(d = standoff_d, h = h + 0.2);
    translate([0, 0, h + 0.2 - hole_len])
      cylinder(d = standoff_hole_d, h = hole_len + 0.01);
  }
}

module standoffs4(pos, size, inset) {
  for (dx = [inset, size[0]-inset], dy = [inset, size[1]-inset])
    translate([pos[0]+dx, pos[1]+dy, 0]) standoff(standoff_h);
}

module standoffs2(pos, size, inset) {
  translate([pos[0]+inset,         pos[1]+inset,         0]) standoff(standoff_h);
  translate([pos[0]+size[0]-inset, pos[1]+size[1]-inset, 0]) standoff(standoff_h);
}

/* boss centres in cavity coords */
function boss_xy() = [for (sx = [0,1], sy = [0,1])
  [boss_off + sx*(inner_x - 2*boss_off), boss_off + sy*(inner_y - 2*boss_off), sx, sy]];

/* underside vent grid centred on [cx, cy] (cavity coords) */
module vent_grid(cx, cy, cols) {
  gw = (cols - 1) * slot_pitch;
  for (i = [0 : cols-1])
    translate([wall + cx - gw/2 + i*slot_pitch - slot_w/2,
               wall + cy - slot_l/2, -1])
      linear_extrude(plate_t + 2)
        offset(r = slot_w/2) translate([slot_w/2, slot_w/2])
          square([0.01, slot_l - slot_w]);
}

/* ===================== top shell ===================== */
module shell() {
  difference() {
    rsolid(outer_x, outer_y, H, rp, re);

    /* cavity (rolled inner ceiling edge, mirrors the outside) */
    translate([wall, wall, -0.1])
      rsolid(inner_x, inner_y, H - top_t + 0.1, rp_i, re);

    /* plate rebate around the bottom rim */
    translate([wall - rebate_w, wall - rebate_w, -0.1])
      rsolid(inner_x + 2*rebate_w, inner_y + 2*rebate_w, rebate_h + 0.1,
             rp_i + rebate_w, 0.5);

    /* USB slot, left wall, rounded corners */
    translate([-1, wall + esp_pos[1] + esp_size[1]/2, plate_t + usb_z + usb_h/2])
      rotate([0, 90, 0])
        linear_extrude(wall + 2)
          offset(r = usb_r)
            square([usb_h - 2*usb_r, usb_w - 2*usb_r], center = true);

    /* wire ports, right wall */
    for (py = [port1_y, port2_y])
      translate([outer_x - wall - 1, wall + py, plate_t + port_z])
        rotate([0, 90, 0]) cylinder(d = port_d, h = wall + 2);

    /* engraved wordmark, front wall */
    if (wordmark != "")
      translate([outer_x/2, wm_deep, wm_z])
        rotate([90, 0, 0])
          linear_extrude(wm_deep + 0.1)
            text(wordmark, size = wm_size, halign = "center", valign = "center",
                 spacing = 1.18, font = "Liberation Sans");
  }

  /* corner bosses — cylinders overlapping the rounded corner walls,
     clipped so nothing pokes through the outer surface */
  intersection() {
    rsolid(outer_x, outer_y, H, rp, re);
    for (b = boss_xy()) {
      bx = wall + b[0];  by = wall + b[1];
      difference() {
        translate([bx, by, plate_t]) cylinder(d = boss_d, h = inner_z + 0.5);
        translate([bx, by, plate_t - 0.1]) cylinder(d = boss_hole_d, h = 12);
      }
    }
  }
}

/* ===================== bottom plate ===================== */
module plate() {
  px = inner_x + 2*(rebate_w - clr);
  py = inner_y + 2*(rebate_w - clr);
  difference() {
    union() {
      translate([wall - rebate_w + clr, wall - rebate_w + clr, 0])
        rsolid(px, py, plate_t, rp_i + rebate_w - clr, 0.4);
      /* PCB standoffs */
      translate([wall, wall, plate_t - 0.2]) {
        standoffs4(esp_pos, esp_size, esp_hole_inset);
        standoffs2(ina_pos, ina_size, ina_hole_inset);
        standoffs4(rly_pos, rly_size, rly_hole_inset);
      }
    }

    /* screws: countersink + rubber-foot recess, all hidden underneath */
    for (b = boss_xy()) {
      bx = wall + b[0];  by = wall + b[1];
      translate([bx, by, -0.1]) cylinder(d = screw_d, h = plate_t + 0.5);
      translate([bx, by, foot_h - 0.05]) cylinder(d1 = csk_d, d2 = screw_d, h = csk_h);
      translate([bx, by, -0.1]) cylinder(d = foot_d, h = foot_h + 0.1);
    }

    /* underside vent grids beneath the warm bays */
    vent_grid(esp_pos[0] + esp_size[0]/2, esp_pos[1] + esp_size[1]/2, 6);
    vent_grid(rly_pos[0] + rly_size[0]/2, rly_pos[1] + rly_size[1]/2, 6);
  }
}

/* ===================== documentation helpers ===================== */
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

/* ===================== output ===================== */
if (part == "shell") shell();
if (part == "plate") plate();

if (part == "assembly") {
  color("#e8eaed") plate();
  color("#f4f5f7") translate([0, 0, 36]) shell();
}

if (part == "beauty") {
  color("#e8eaed") plate();
  color("#f4f5f7") shell();
}

if (part == "print") {
  plate();
  translate([0, 2*outer_y + 14, H]) rotate([180, 0, 0]) shell();
}

if (part == "layout") {
  color("#cfd6dc") plate();
  translate([wall, wall, plate_t + standoff_h]) {
    dummy_board(esp_pos, esp_size, "ESP32", "SeaGreen", 7);
    dummy_board(ina_pos, ina_size, "INA219", "Purple", 4.5);
    dummy_board(rly_pos, rly_size, "RELAY", "RoyalBlue", 6);
    color("SkyBlue", 0.55) translate([rly_pos[0]+4, rly_pos[1]+5, 1.6])
      cube([19, 15, 16]);
  }
  ground_label(-16, wall + esp_pos[1] + esp_size[1]/2, "USB");
  ground_label(outer_x + 22, wall + port1_y - 6, "FAN /");
  ground_label(outer_x + 22, wall + port1_y - 14, "LOAD");
  ground_label(outer_x + 24, wall + port2_y - 6, "BATTERY");
}
