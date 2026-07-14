/*
 * ZUTOMAYO retro desktop fan body
 * --------------------------------
 * A Kinscoter-style retro stand for a bare 2-wire axial DC fan, so the
 * project's load looks like a proper vintage desk fan. Three printed
 * parts, all support-free:
 *
 *   head_back   rear cage: fan mount posts, stem socket, rear grille
 *   head_front  front grille: rings + spokes, ZTMY eye hub, 3 screw ears
 *   stand       base with fake buttons + stem with square tenon
 *
 * Assembly: screw the fan onto the rear posts (M3 self-tap into posts,
 * screws pass through the fan's own corner holes), route the wire out
 * through the stem groove, drop the head onto the stem tenon, lock with
 * one M3 from the back, screw the front grille on (3× M3).
 *
 * Units: mm. Fan dimensions are PLACEHOLDERS for a 40 mm axial fan —
 * measure yours and edit below.
 *
 * part = "assembly" | "head_back" | "head_front" | "stand" | "print"
 *
 *   openscad -o fan-head-back.stl  -D 'part="head_back"'  retro-fan.scad
 *   openscad -o fan-head-front.stl -D 'part="head_front"' retro-fan.scad
 *   openscad -o fan-stand.stl      -D 'part="stand"'      retro-fan.scad
 */

part = "assembly";

/* ===================== PARAMETERS ===================== */

/* ---- the fan you already own (measure it!) ---- */
fan_size       = 40;    // square frame edge length
fan_t          = 10;    // frame thickness
fan_holes      = 32;    // mounting hole spacing (centre to centre)
fan_pilot      = 2.7;   // pilot in the posts for M3 self-tapping screws

/* ---- cage ---- */
cage_od     = 96;       // cage outer diameter (retro look ≈ 2.2–2.5× fan)
wall_t      = 3;
cage_depth  = fan_t + 16;
grille_t    = 2.4;      // grille plate thickness
ring_w      = 2.2;      // grille ring width
hub_front   = 28;       // front hub disc (carries the ZTMY eye)
hub_rear    = 20;
post_h      = 6;        // fan sits this far in front of the rear grille
boss_angs   = [90, 210, 330];  // front-grille screw bosses
lip_clr     = 0.4;      // front lip to cage wall clearance

/* ---- stand ---- */
base_x = 110;  base_y = 80;  base_z = 20;  base_r = 14;  base_edge = 2.5;
stem_d = 16;   stem_h = 60;
stem_pos = [base_x/2, 52];      // stem centre on the base
tenon    = 10;  tenon_h = 18;   // square tenon on top of the stem
socket_clr = 0.3;

/* ---- dress-up ---- */
wordmark = "ZUTOMAYO";
eye_w = 16;  eye_h = 8;         // eye on the front hub
deep  = 0.6;                    // engraving depth

$fs = 0.6; $fa = 5;

/* ===================== shared 2D motifs ===================== */
module capsule2d(w, h) { offset(r = h/2) square([w - h, 0.01], center = true); }

module badge2d(w, h, line, txt, tsize) {
  difference() { capsule2d(w, h); capsule2d(w - 2*line, h - 2*line); }
  if (txt != "")
    text(txt, size = tsize, halign = "center", valign = "center",
         spacing = 1.06, font = "Liberation Sans:style=Bold");
}

module eye2d() {
  R = (pow(eye_w/2, 2) + pow(eye_h/2, 2)) / eye_h;
  line = 1.1;
  difference() {
    intersection() {
      translate([0,  R - eye_h/2]) circle(R);
      translate([0, -(R - eye_h/2)]) circle(R);
    }
    intersection() {
      translate([0,  R - eye_h/2]) circle(R - line);
      translate([0, -(R - eye_h/2)]) circle(R - line);
    }
  }
  difference() { circle(3.0); circle(1.9); }
  circle(1.05);
  for (a = [-32, 0, 32])
    rotate(a) translate([0, eye_h/2 + 2.2]) square([1.1, 3.1], center = true);
}

module star2d(r) {
  rotate(15)
    polygon([[0, r], [r*0.32, r*0.32], [r, 0], [r*0.32, -r*0.32],
             [0, -r], [-r*0.32, -r*0.32], [-r, 0], [-r*0.32, r*0.32]]);
}

/* ===================== shared solids ===================== */
module rounded_col(r, edge, h) {
  cylinder(r = r, h = h - edge);
  translate([0, 0, h - edge]) {
    rotate_extrude() translate([r - edge, 0]) circle(r = edge);
    cylinder(r = r - edge, h = edge);
  }
}

module rsolid(x, y, h, r, edge) {
  hull()
    for (cx = [r, x - r], cy = [r, y - r])
      translate([cx, cy, 0]) rounded_col(r, edge, h);
}

/* grille pattern: hub + concentric rings + spokes, trimmed to rim */
module grille2d(od, hub, nrings, nspokes, spoke_w, rim_w) {
  intersection() {
    union() {
      circle(d = hub);
      for (i = [1 : nrings]) {
        r = hub/2 + (od/2 - rim_w - hub/2) * i / (nrings + 0.4);
        difference() { circle(r + ring_w/2); circle(r - ring_w/2); }
      }
      for (a = [0 : 360/nspokes : 359])
        rotate(a) translate([0, od/4]) square([spoke_w, od/2], center = true);
      difference() { circle(d = od); circle(d = od - 2*rim_w); }  // rim
    }
    circle(d = od);
  }
}

/* ===================== head, rear half ===================== */
/* modelled in print orientation: rear face on the bed, axis +z */
module head_back() {
  blk_y0 = -cage_od/2 - 10;   // stem block, sticks 10 below the cage

  difference() {
    union() {
      /* rear grille */
      linear_extrude(grille_t)
        grille2d(cage_od, hub_rear, 2, 6, 5, 4);
      /* cage wall */
      linear_extrude(cage_depth)
        difference() { circle(d = cage_od); circle(d = cage_od - 2*wall_t); }
      /* stem block */
      translate([-10, blk_y0, 0]) cube([20, 14.5, cage_depth]);
    }

    /* sparkle on the rear hub */
    translate([0, 0, -0.1]) linear_extrude(deep + 0.1) star2d(4.5);

    /* square socket for the stem tenon (blind, from below) */
    translate([-(tenon + socket_clr)/2, blk_y0 - 0.5, (cage_depth - tenon - socket_clr)/2])
      cube([tenon + socket_clr, tenon_h + 1, tenon + socket_clr]);

    /* cross screw that locks the tenon (M3 self-tap from the rear) */
    translate([0, blk_y0 + 7, -1]) cylinder(d = 2.8, h = 14);

    /* cable groove down the back of the block */
    translate([-3, blk_y0 - 0.5, -0.1]) cube([6, 15.5, 3.5]);
  }

  /* fan mount posts */
  for (sx = [-1, 1], sy = [-1, 1])
    translate([sx*fan_holes/2, sy*fan_holes/2, grille_t - 0.1])
      difference() {
        cylinder(d = 7, h = post_h + 0.1);
        translate([0, 0, post_h - 7.9]) cylinder(d = fan_pilot, h = 8.2);
      }

  /* bosses for the front grille screws */
  for (a = boss_angs)
    rotate(a) translate([0, cage_od/2 - wall_t - 3.2, 8])
      difference() {
        cylinder(d = 8, h = cage_depth - 8);
        translate([0, 0, cage_depth - 16.1]) cylinder(d = 2.6, h = 8.3);
      }
}

/* ===================== head, front grille ===================== */
/* modelled in print orientation: show face on the bed */
module head_front() {
  difference() {
    union() {
      /* face: rings + spokes + big hub */
      linear_extrude(grille_t)
        grille2d(cage_od, hub_front, 3, 8, 4, 4);
      /* lip ring, slides inside the cage wall */
      translate([0, 0, grille_t - 0.1])
        linear_extrude(5.1)
          difference() {
            circle(d = cage_od - 2*wall_t - lip_clr*2);
            circle(d = cage_od - 2*wall_t - lip_clr*2 - 6);
          }
      /* screw ears over the bosses */
      for (a = boss_angs)
        rotate(a) translate([0, cage_od/2 - wall_t - 3.2, 0])
          cylinder(d = 9, h = grille_t + 5);
    }
    /* ZTMY eye on the front hub */
    translate([0, 0, -0.1]) linear_extrude(deep + 0.1) eye2d();
    /* screw holes + countersinks */
    for (a = boss_angs)
      rotate(a) translate([0, cage_od/2 - wall_t - 3.2, 0]) {
        translate([0, 0, -0.5]) cylinder(d = 3.4, h = grille_t + 6);
        translate([0, 0, -0.05]) cylinder(d1 = 6.4, d2 = 3.4, h = 1.6);
      }
  }
}

/* ===================== stand ===================== */
module stand() {
  difference() {
    union() {
      rsolid(base_x, base_y, base_z, base_r, base_edge);
      translate([stem_pos[0], stem_pos[1], base_z - 2])
        cylinder(d = stem_d, h = stem_h + 2);
      translate([stem_pos[0] - tenon/2, stem_pos[1] - tenon/2, base_z + stem_h])
        cube([tenon, tenon, tenon_h]);
    }

    /* wordmark badge, front face */
    translate([base_x/2, deep, base_z/2])
      rotate([90, 0, 0])
        linear_extrude(deep + 0.1) badge2d(42, 10, 1.1, wordmark, 3.8);

    /* cable groove down the back of the stem */
    translate([stem_pos[0] - 3, stem_pos[1] + stem_d/2 - 2.5, base_z + 1])
      cube([6, 4, stem_h + tenon_h + 2]);
    /* wire drop into the base */
    translate([stem_pos[0], stem_pos[1] + 5, -1]) cylinder(d = 7, h = base_z + 4);
    /* wire channel across the underside, out the back */
    translate([stem_pos[0] - 3.5, stem_pos[1] + 4, -0.1])
      cube([7, base_y - stem_pos[1] - 3, 5]);

    /* rubber foot recesses */
    for (fx = [16, base_x - 16], fy = [14, base_y - 14])
      translate([fx, fy, -0.1]) cylinder(d = 9, h = deep + 0.1);
  }

  /* fake speed buttons, front of the base top (paint one orange!) */
  for (i = [0 : 3])
    translate([base_x/2 - 24 + i*16, 20, base_z - 0.5])
      linear_extrude(3.7) capsule2d(12, 7);
}

/* ===================== output ===================== */
if (part == "head_back")  head_back();
if (part == "head_front") head_front();
if (part == "stand")      stand();

if (part == "assembly") {
  hz = base_z + stem_h + cage_od/2 + 10;   // cage centre height
  color("#e8eaed") stand();
  color("#f4f5f7")
    translate([stem_pos[0], stem_pos[1] + 13, hz]) rotate([90, 0, 0]) head_back();
  color("#f4f5f7")
    translate([stem_pos[0], stem_pos[1] + 13 - cage_depth - grille_t, hz])
      rotate([-90, 0, 0]) rotate([0, 0, 180]) head_front();
  /* ghost of the user's fan */
  color("#9aa3af", 0.85)
    translate([stem_pos[0] - fan_size/2,
               stem_pos[1] + 13 - grille_t - post_h - fan_t,
               hz - fan_size/2])
      cube([fan_size, fan_t, fan_size]);
}

if (part == "print") {
  translate([cage_od/2, cage_od/2, 0]) head_back();
  translate([cage_od + 60 + cage_od/2, cage_od/2, 0]) head_front();
  translate([2*cage_od + 90, 10, 0]) stand();
}
