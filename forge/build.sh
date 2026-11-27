#!/bin/bash
# Rebuilds every asset from source. Needs python3 with numpy, scipy, pillow, and Blender's Python (bpy 4.2).
#   BPY=/path/to/python-with-bpy ./build.sh      (or: BPY="blender -b -P" ./build.sh)
set -e; cd "$(dirname "$0")"; BPY=${BPY:-python3}
OMP_NUM_THREADS=1 python3 materials.py; python3 cutouts.py
for k in 0 1 2 3; do $BPY build_props.py $k 4 & done; wait; python3 pack.py
for k in 0 1 2 3; do $BPY build_chars.py $k 4 & done; wait; python3 pack_chars.py
echo "Optional: $BPY ui_render.py (interface furniture, written to forge/.work)"
