# Checagem de ponta a ponta no MP4 final: o áudio mixado (voz + trilha) é
# alinhado com o MMS_FA bloco a bloco, e os tempos medidos são comparados com
# os tempos das legendas em src/data/timeline.json (palavras faladas → token).
# Uso: python3 -I scripts/verificar-final.py ../out/tiktok-lingua-sumeria.mp4 [limite_ms=150]
import json, re, subprocess, sys, unicodedata
import numpy as np, torch, torchaudio

mp4 = sys.argv[1]; LIM = float(sys.argv[2]) if len(sys.argv) > 2 else 150
b = torchaudio.pipelines.MMS_FA; SR = b.sample_rate
model = b.get_model(with_star=False).eval(); tok, aligner = b.get_tokenizer(), b.get_aligner()
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
audio = torch.from_numpy(np.frombuffer(raw, dtype=np.float32).copy())
rom = lambda w: re.sub(r"[^a-z']", "", "".join(c for c in unicodedata.normalize("NFD", w.lower()) if unicodedata.category(c) != "Mn"))
tl = json.load(open("src/data/timeline.json")); rot = json.load(open("src/data/roteiro.json"))
tre = re.compile(r"\[([^|\]]+)\|([^\]]+)\]|(\S+)")
difs, fora = [], []
medido = {}  # índice da palavra de legenda → (início, fim) medidos, em ms
for blk in tl["blocks"]:
    src = next(x["src"] for x in rot["blocks"] if x["id"] == blk["id"])
    falas = [(m.group(3) or m.group(2)).split() for m in tre.finditer(src)]
    a0 = max(0, blk["startMs"] / 1000 - 0.3); a1 = blk["endMs"] / 1000 + 0.3
    seg = audio[int(a0 * SR):int(a1 * SR)].unsqueeze(0)
    with torch.inference_mode():
        em, _ = model(seg)
    words = [w for f in falas for w in f]
    spans = aligner(em[0], tok([rom(w) for w in words])); r = seg.size(1) / em.size(1) / SR
    n = 0
    for ti, f in enumerate(falas):
        sp = spans[n:n + len(f)]; n += len(f)
        s_med, e_med = a0 + sp[0][0].start * r, a0 + sp[-1][-1].end * r
        w = tl["words"][blk["firstWord"] + ti]
        ds, de = w["startMs"] - s_med * 1000, w["endMs"] - e_med * 1000
        medido[blk["firstWord"] + ti] = (s_med * 1000, e_med * 1000)
        difs += [abs(ds), abs(de)]
        if abs(ds) > LIM or abs(de) > LIM: fora.append({"legenda": w["text"], "inicio_ms": round(ds), "fim_ms": round(de)})
d = np.array(difs)
# páginas de legenda: entrada × início da 1ª palavra; saída × fim da última palavra
pg = []
for p in tl["pages"]:
    s0, e1 = medido[p["words"][0]][0], medido[p["words"][-1]][1]
    pg.append((p["startMs"] - s0, p["endMs"] - e1, " ".join(tl["words"][k]["text"] for k in p["words"])))
pa = np.array([abs(x) for a, b2, _ in pg for x in (a, b2)])
res_pg = {"paginas": len(pg), "mediana_ms": round(float(np.median(pa)), 1), "p95_ms": round(float(np.percentile(pa, 95)), 1), "max_ms": round(float(pa.max()), 1),
          "acima_de_150ms": [{"pagina": t, "entrada_ms": round(a), "saida_ms": round(b2)} for a, b2, t in pg if abs(a) > LIM or abs(b2) > LIM]}
res = {"paginas_de_legenda": res_pg, "tokens": len(difs) // 2, "mediana_ms": round(float(np.median(d)), 1), "p95_ms": round(float(np.percentile(d, 95)), 1), "max_ms": round(float(d.max()), 1), "acima_de_150ms": fora}
json.dump(res, open("public/audio/voz/sincronia-final.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False))
