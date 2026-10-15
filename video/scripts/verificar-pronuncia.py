# Conferência da pronúncia com faster-whisper (modelo "medium", pt): transcreve
# cada bloco de public/audio/voz/*.mp3 e casa as palavras com o roteiro.
# Os tempos por palavra do Whisper são só indicativos (erram 100–300 ms);
# a sincronia é medida com precisão em scripts/alinhar-mms.py.
# Uso: python3 -I scripts/verificar-sincronia.py [limite_ms=150]
import difflib, json, re, subprocess, sys, unicodedata
import numpy as np
from faster_whisper import WhisperModel

LIMITE = float(sys.argv[1]) if len(sys.argv) > 1 else 150.0
model = WhisperModel("medium", device="cpu", compute_type="int8")

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))

roteiro = json.load(open("src/data/roteiro.json"))
tok_re = re.compile(r"\[([^|\]]+)\|([^\]]+)\]|(\S+)")
relatorio = {"limite_ms": LIMITE, "blocos": []}
todas = []
for b in roteiro["blocks"]:
    al = json.load(open(f"public/audio/voz/{b['id']}.json"))
    chars = al["alignment"]["characters"]
    st = al["alignment"]["character_start_times_seconds"]
    en = al["alignment"]["character_end_times_seconds"]
    texto = "".join(chars)
    # palavras faladas (cada token [tela|fala] pode ter várias) com tempos ElevenLabs
    eleven, pos = [], 0
    for m in tok_re.finditer(b["src"]):
        fala = m.group(3) or m.group(2)
        tela = m.group(3) or m.group(1)
        for w in fala.split():
            i0 = texto.index(w, pos); i1 = i0 + len(w) - 1; pos = i1 + 1
            j = i1
            while j > i0 and not chars[j].isalnum(): j -= 1
            eleven.append({"w": w, "tela": tela, "s": st[i0], "e": en[j]})
    # tempos usados nas legendas: os ajustados à onda (ajustar-tempos.py), se existirem
    dj = json.load(open(f"public/audio/voz/{b['id']}.json"))
    if "words" in dj:
        for n, x in enumerate(eleven):
            x["s"], x["e"] = dj["words"][n]["s"], dj["words"][n]["e"]
    segs, _ = model.transcribe(load(f"public/audio/voz/{b['id']}.mp3"), language="pt", word_timestamps=True, beam_size=5)
    wh = [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in s.words]
    transcr = " ".join(w["w"] for w in wh)
    a = [norm(x["w"]) for x in eleven]; c = [norm(x["w"]) for x in wh]
    sm = difflib.SequenceMatcher(a=a, b=c, autojunk=False)
    pares = []
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            e, w = eleven[blk.a + k], wh[blk.b + k]
            pares.append({"palavra": e["w"], "ds_ms": round((e["s"] - w["s"]) * 1000), "de_ms": round((e["e"] - w["e"]) * 1000)})
    nao = [eleven[i]["w"] for i in range(len(eleven)) if not any(blk.a <= i < blk.a + blk.size for blk in sm.get_matching_blocks())]
    ruins = [p for p in pares if abs(p["ds_ms"]) > LIMITE or abs(p["de_ms"]) > LIMITE]
    todas += pares
    relatorio["blocos"].append({"id": b["id"], "whisper": transcr, "casadas": len(pares), "total": len(eleven), "sem_par_no_whisper": nao, "acima_do_limite": ruins})
    print(f"\n[{b['id']}] {len(pares)}/{len(eleven)} palavras casadas | > {LIMITE:.0f} ms: {len(ruins)}")
    print(f"  whisper: {transcr}")
    if nao: print(f"  sem par: {nao}")
    for r in ruins: print(f"  ⚠ {r}")

ds = np.array([abs(p["ds_ms"]) for p in todas]); de = np.array([abs(p["de_ms"]) for p in todas])
relatorio["resumo"] = {"palavras_casadas": len(todas), "inicio_mediana_ms": float(np.median(ds)), "inicio_p95_ms": float(np.percentile(ds, 95)), "fim_mediana_ms": float(np.median(de)), "fim_p95_ms": float(np.percentile(de, 95)), "acima_do_limite": int(((ds > LIMITE) | (de > LIMITE)).sum())}
json.dump(relatorio, open("public/audio/voz/pronuncia-whisper.json", "w"), ensure_ascii=False, indent=1)
print("\nresumo:", relatorio["resumo"])
