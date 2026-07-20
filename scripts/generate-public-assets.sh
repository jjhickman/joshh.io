#!/bin/sh
set -eu

task_tmp=$(mktemp -d)
trap 'rm -rf "$task_tmp"' EXIT

awk 'BEGIN {
  w=256; h=256; print "P3\n" w, h "\n255";
  for (y=0; y<h; y++) for (x=0; x<w; x++) {
    r=6+int(6*y/h); g=10+int(11*y/h); b=16+int(16*y/h);
    j=(x>=58 && x<78 && y>=48 && y<176) || (x>=30 && x<78 && y>=156 && y<176);
    hh=(x>=112 && x<132 && y>=48 && y<208) || (x>=180 && x<200 && y>=48 && y<208) || (x>=132 && x<180 && y>=116 && y<136);
    if (j || hh) { r=142; g=229; b=232; }
    print r, g, b;
  }
}' > "$task_tmp/icon.ppm"

awk 'BEGIN {
  w=1200; h=630; print "P3\n" w, h "\n255";
  for (y=0; y<h; y++) for (x=0; x<w; x++) {
    dx=(x-875)/430; dy=(y-250)/330; glow=1-(dx*dx+dy*dy); if (glow<0) glow=0;
    edge=(x+y)/(w+h); r=5+int(10*edge)+int(7*glow); g=8+int(16*edge)+int(43*glow); b=14+int(26*edge)+int(48*glow);
    silhouette=(x>820 && y>300+(x-820)*0.18 && y>520-(x-820)*0.28);
    if (silhouette) { r=2; g=5; b=8; }
    print r, g, b;
  }
}' > "$task_tmp/og.ppm"

sips --resampleHeightWidth 180 180 -s format png "$task_tmp/icon.ppm" --out public/apple-touch-icon.png >/dev/null
sips --resampleHeightWidth 64 64 -s format ico "$task_tmp/icon.ppm" --out public/favicon.ico >/dev/null
sips -s format jpeg -s formatOptions 86 "$task_tmp/og.ppm" --out public/og-default.jpg >/dev/null
