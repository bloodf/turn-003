#!/bin/bash
# rebuild a few creatures: ./quick.sh name name ...   (keeps the rest)
cd "$(dirname "$0")"; B=~/.cache/realmwright-blender/bpy.sh; rm -f .work/chars_9*.pkl; i=90; n=$(( ($#+3)/4 )); while [ $# -gt 0 ]; do $B build_chars.py $i 99 "${@:1:$n}" > .work/q$i.log 2>&1 & shift $(( $# < n ? $# : n )); i=$((i+1)); done; wait; grep -h -A6 FAIL .work/q9*.log; python3 pack_chars.py
