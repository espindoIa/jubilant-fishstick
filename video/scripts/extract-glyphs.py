# Extrai contornos dos sinais (Noto Sans Cuneiform, OFL) como paths SVG, um por contorno (~cunha).
import json, sys, unicodedata
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.boundsPen import BoundsPen

font_path, out_path = sys.argv[1], sys.argv[2]
SIGNS = {"LUGAL": 0x12217, "LU2": 0x121FD, "GAL": 0x120F2, "E2": 0x1208D, "AN": 0x1202D, "EN": 0x12097, "KID": 0x121A4}
# + todos os sinais das linhas reais (src/data/linhas-cuneiformes.json), pelo código Unicode
import os
_lin = os.path.join(os.path.dirname(out_path), "linhas-cuneiformes.json")
if os.path.exists(_lin):
    for l in json.load(open(_lin))["linhas"]:
        for sg in l["sinais"]:
            for cp in (sg.get("codepoint") or "").split():
                c = int(cp[2:], 16)
                SIGNS[unicodedata.name(chr(c)).replace("CUNEIFORM SIGN ", "").replace(" ", "_")] = c
f = TTFont(font_path)
gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm
out = {"unitsPerEm": upm, "signs": {}}
for name, cp in SIGNS.items():
    assert unicodedata.name(chr(cp)).replace(" ", "_") == f"CUNEIFORM_SIGN_{name}", name
    g = gs[cmap[cp]]
    rec = DecomposingRecordingPen(gs); g.draw(rec)
    contours, cur = [], []
    for op, args in rec.value:
        cur.append((op, args))
        if op in ("closePath", "endPath"):
            contours.append(cur); cur = []
    paths = []
    for c in contours:
        sp = SVGPathPen(gs); bp = BoundsPen(gs)
        for op, args in c:
            getattr(sp, op)(*args); getattr(bp, op)(*args)
        x0, y0, x1, y1 = bp.bounds
        paths.append({"d": sp.getCommands(), "cx": (x0 + x1) / 2, "cy": (y0 + y1) / 2,
                      "area": (x1 - x0) * (y1 - y0)})
    bp = BoundsPen(gs); g.draw(bp)
    out["signs"][name] = {"codepoint": f"U+{cp:X}", "char": chr(cp), "advance": g.width,
                          "bounds": bp.bounds, "contours": paths}
    print(name, f"U+{cp:X}", len(paths), "contornos", bp.bounds)
json.dump(out, open(out_path, "w"))
