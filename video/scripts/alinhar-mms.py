# Sincronia legenda × áudio, medida de forma independente.
# Os tempos por palavra devolvidos pela ElevenLabs (alinhamento por caractere)
# são comparados com um alinhamento forçado feito por outro modelo:
# torchaudio MMS_FA (wav2vec2 multilíngue, ~20 ms de resolução).
# Regra pedida: desvio > 150 ms = corrigir. Nesses casos a borda da palavra
# passa a usar o tempo medido pelo MMS; nos demais, fica o da ElevenLabs.
# Saída: campo "words" em public/audio/voz/<bloco>.json
#        [{w, s, e, s_el, e_el, s_mms, e_mms}] + public/audio/voz/sincronia.json
# Uso: python3 -I scripts/alinhar-mms.py [limite_ms=150]
import json, re, subprocess, sys, unicodedata
import numpy as np
import torch, torchaudio

LIMITE = (float(sys.argv[1]) if len(sys.argv) > 1 else 150.0) / 1000
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval()
tokenizer, aligner = bundle.get_tokenizer(), bundle.get_aligner()
SR = bundle.sample_rate

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return torch.from_numpy(np.frombuffer(raw, dtype=np.float32).copy()).unsqueeze(0)

def romaniza(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z']", "", w)

roteiro = json.load(open("src/data/roteiro.json"))
rel = {"limite_ms": LIMITE * 1000, "blocos": {}}
difs, corrigidas, total = [], 0, 0
for b in roteiro["blocks"]:
    path = f"public/audio/voz/{b['id']}.json"
    d = json.load(open(path)); al = d["alignment"]
    t = "".join(al["characters"])
    words, i = [], 0
    for w in t.split(" "):
        if not w: continue
        j = t.index(w, i); i = j + len(w)
        k = i - 1
        while k > j and not t[k].isalnum(): k -= 1
        words.append({"w": w, "s_el": al["character_start_times_seconds"][j], "e_el": al["character_end_times_seconds"][k]})
    wav = load(f"public/audio/voz/{b['id']}.mp3")
    with torch.inference_mode():
        emission, _ = model(wav)
    transcript = [romaniza(w["w"]) for w in words]
    spans = aligner(emission[0], tokenizer(transcript))
    ratio = wav.size(1) / emission.size(1) / SR
    bloco = []
    for w, sp in zip(words, spans):
        w["s_mms"] = round(sp[0].start * ratio, 3)
        w["e_mms"] = round(sp[-1].end * ratio, 3)
        ds, de = w["s_el"] - w["s_mms"], w["e_el"] - w["e_mms"]
        w["s"] = w["s_mms"] if abs(ds) > LIMITE else w["s_el"]
        w["e"] = w["e_mms"] if abs(de) > LIMITE else w["e_el"]
        difs += [abs(ds), abs(de)]; total += 2
        if abs(ds) > LIMITE or abs(de) > LIMITE:
            corrigidas += 1
            bloco.append({"palavra": w["w"], "inicio_el_menos_mms_ms": round(ds * 1000), "fim_el_menos_mms_ms": round(de * 1000)})
    d["words"] = words
    json.dump(d, open(path, "w"), ensure_ascii=False, indent=1)
    rel["blocos"][b["id"]] = bloco
    print(f"[{b['id']}] {len(words)} palavras, corrigidas (>{LIMITE*1000:.0f} ms): {len(bloco)}")
    for x in bloco: print("   ", x)
dd = np.array(difs) * 1000
rel["resumo_el_vs_mms"] = {"bordas": total, "mediana_ms": float(np.median(dd)), "p95_ms": float(np.percentile(dd, 95)), "max_ms": float(dd.max()), "palavras_corrigidas": corrigidas}
json.dump(rel, open("public/audio/voz/sincronia.json", "w"), ensure_ascii=False, indent=1)
print("\nElevenLabs × MMS:", rel["resumo_el_vs_mms"])
